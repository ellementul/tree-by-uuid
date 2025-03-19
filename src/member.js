import { MemberFactory, connectionEvent } from "@ellementul/uee-core"
import { addEvent, checkEvent, checkRootEvent, removeEvent, requestEvent, restoreEvent, storageCreatedEvent, storageFullSyncedEvent, storageSyncedTreeEvent, storageSynchronizationEvent, syncEvent, syncRootEvent, updateEvent, upsertEvent } from "./events.js"
import { TreeByUuid } from "./storage.js"


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid

        this.leavesForSync = new LeafBuffer
    }

    checkType(payload) {
        return this._storageType === payload.storageType && payload.storageId != this._uuid
    }

    send(event, payload) {
        if(payload) {
            payload.storageType = this._storageType
        }

        super.send(event, payload)
    }

    init() {
        this.subscribe(connectionEvent, event => this.onConnection(event))
        
        this.subscribe(addEvent,        event => this.checkType(event) && this.addItem(event))
        this.subscribe(updateEvent,     event => this.checkType(event) && this.update(event))
        this.subscribe(removeEvent,     event => this.checkType(event) && this.remove(event))
        this.subscribe(restoreEvent,    event => this.checkType(event) && this.restore(event))

        
        this.subscribe(checkRootEvent,  event => this.checkType(event) && this.checkRoot(event))
        this.subscribe(checkEvent,      event => this.checkType(event) && this.check(event))
        this.subscribe(syncEvent,       event => this.checkType(event) && this.sync(event))
        this.subscribe(requestEvent,    event => this.checkType(event) && this.request(event))
        this.subscribe(upsertEvent,     event => this.checkType(event) && this.upsert(event))

        if(!this.created) {
            this.created = true
            this.send(storageCreatedEvent, { isReadyForItems: true })
        }
    }

    onMakeRoom() {
        this.init()
    }

    onJoinRoom() {
        this.init()
        this.syncRoot()
    }

    onConnection({ isHost }) {
        if(!isHost)
            this.syncRoot()
    }

    syncRoot() {
        this.subscribe(syncRootEvent, event => this.checkType(event) && this.isNeedResync(event), null, 1)

        this.send(checkRootEvent, {
            storageId: this._uuid,
            hash: this.db.getHashRoot()
        })
    }

    isNeedResync({ hash }) {
        if(this.db.getHashRoot() !== hash && this.db.isSyncRoot) {

            this.db.resyncRoot()

            this.send(storageSynchronizationEvent)
            this.send(checkEvent, {
                tuid: "",
                storageId: this._uuid,
                hash: this.db.getHashRoot(),
                syncedChildren: []
            })
        }
    }

    checkRoot({ hash }) {
        if(this.db.getHashRoot() !== hash)
            this.send(syncRootEvent, {
                hash: this.db.getHashRoot(),
                storageId: this._uuid
            })
    }

    check({ tuid, hash, syncedChildren }) {
        if(!this.db.isSyncRoot)
            return

        const validBranch = this.db.checkBranch({ tuid, hash, syncedChildren })
        this.send(syncEvent, {
            ...validBranch,
            storageId: this._uuid,
        })
    }

    sync({ tuid, hash, leafHash }) {
        if(this.db.isSyncRoot)
            return

        const branchToCheck = this.db.syncBranch({ tuid, hash, leafHash })

        if(this.db.isSyncRoot) {
            this.send(storageSyncedTreeEvent)
            this.loadLeaves()
        }
        else {
            this.send(checkEvent, {
                ...branchToCheck,
                storageId: this._uuid
            })
        }
    }

    loadLeaves() {
        if(this.db.isNeedSyncLeaves)
            this.leavesForSync.push(this.db.getNeededLeaves())

        if(!this.leavesForSync.isEmpty) { 
            this.send(requestEvent, {
                leaves: [...this.leavesForSync.getNextBuffer()]
            })
        }
        else {
            this.send(storageFullSyncedEvent)
        }
    }

    request({ leaves }) {
        const leaf = leaves[Math.floor(Math.random()*leaves.length)]

        const item = this.db.get(leaf)

        if(item)
            this.send(upsertEvent, { item })
    }

    upsert({ item }) {

        if(this.db.has(item.tuid))
            this.db.updateObject(item)
        else
            this.db.addObject(item)

        if(!this.leavesForSync.isEmpty) {
            this.leavesForSync.delete(item.tuid)
            this.loadLeaves()
        }
    }

    addItem({ hash, data }) {

        const { tuid } = this.db.addNewObject({ hash, data })
        const item = this.db.get(tuid)

        this.send(upsertEvent, { item })
    }

    update({ tuid, hash, data }) {
        if(!this.db.has(tuid))
            return

        this.db.updateData({ tuid, hash, data })

        const item = this.db.get(tuid)
        this.send(upsertEvent, { item })
    }

    remove({ tuid }) {
        if(!this.db.has(tuid))
            return

        this.db.remove(tuid)

        const item = this.db.get(tuid)
        this.send(upsertEvent, { item })
    }

    restore({ tuid }) {
        if(!this.db.has(tuid))
            return

        this.db.restore(tuid)

        const item = this.db.get(tuid)
        this.send(upsertEvent, { item })
    }
}

class LeafBuffer {
    constructor() {
        this.buffers = []
        this.nextBufferNumber = 0
    }

    get isEmpty() {
        return !this.buffers[0] || this.buffers[0].size == 0
    }

    getNextBuffer() {
        this.incrementBufferNumber()

        while(this.buffers[this.nextBufferNumber]) {
            if(this.buffers[this.nextBufferNumber].size != 0)
                break

            this.buffers.splice(this.nextBufferNumber, 1)
            this.incrementBufferNumber()
        }

        return this.buffers[this.nextBufferNumber].values()
    }

    incrementBufferNumber() {
        this.nextBufferNumber++

        if(this.nextBufferNumber >= this.buffers.length)
            this.nextBufferNumber = 0   
    }

    push(leaves) {
        for (const leaf of leaves) {
            if(!this.buffers[this.buffers.length - 1])
                this.buffers.push(new Set)

            if(this.buffers[this.buffers.length - 1].size > 50)
                this.buffers.push(new Set)

            this.buffers[this.buffers.length - 1].add(leaf) 
        }
    }

    delete(leaf) {
        for (let index in this.buffers) {
            if(this.buffers[index].has(leaf))
                this.buffers[index].delete(leaf)
        }
    }
}