import { MemberFactory, connectionEvent } from "@ellementul/uee-core"
import { addEvent, checkEvent, removeEvent, requestEvent, restoreEvent, syncEvent, updateEvent, upsertEvent } from "./events.js"
import { TreeByUuid } from "./storage.js"


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid
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
        this.subscribe(requestEvent,    event => this.checkType(event) && this.request(event))
        this.subscribe(addEvent,        event => this.checkType(event) && this.addItem(event))
        this.subscribe(upsertEvent,     event => this.checkType(event) && this.upsert(event))
        this.subscribe(updateEvent,     event => this.checkType(event) && this.update(event))
        this.subscribe(removeEvent,     event => this.checkType(event) && this.remove(event))
        this.subscribe(restoreEvent,    event => this.checkType(event) && this.restore(event))
        this.subscribe(checkEvent,      event => this.checkType(event) && this.check(event))
    }

    syncRoot() {
        this.subscribe(syncEvent, event => this.checkType(event) && this.isNeedResync(event), null, 1)

        this.send(checkEvent, {
            storageId: this._uuid,
            tuid: "",
            hash: this.db.getHashRoot(),
            syncedChildren: [],
            checkRoot: true
        })
    }

    isNeedResync({ tuid, hash, leafHash }) {
        if(!tuid && this.db.getHashRoot() !== hash)
            this.resync({ tuid, hash, leafHash })
    }

    resync({ tuid, hash, leafHash }) {
        this.db.resyncRoot()

        this.unsubscribe(syncEvent)
        this.subscribe(syncEvent, event => this.checkType(event) && this.sync(event))

        this.sync({ tuid, hash, leafHash })
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

    sync({ tuid, hash, leafHash }) {
        if(this.db.isSyncRoot)
            return

        const branchToCheck = this.db.syncBranch({ tuid, hash, leafHash })

        if(this.db.isNeedSyncLeaves)
            return this.loadLeaves()

        if(this.db.isSyncRoot) {
            this.unsubscribe(syncEvent)
        }
        else {
            this.send(checkEvent, {
                ...branchToCheck,
                storageId: this._uuid,
                checkRoot: false
            })
        }
    }

    check({ tuid, hash, syncedChildren, checkRoot }) {
        if(!this.db.isSyncRoot)
            return

        if(checkRoot && this.db.getHashRoot() !== hash)
            return this.send(syncEvent, {
                tuid: '',
                hash: this.db.getHashRoot(),
                leafHash: '',
                storageId: this._uuid
            })


        const validBranch = this.db.checkBranch({ tuid, hash, syncedChildren })
        this.send(syncEvent, {
            ...validBranch,
            storageId: this._uuid,
        })
    }

    loadLeaves() {
       const leaves = this.db.getNeededLeaves()
       
       leaves.forEach(tuid => this.send(requestEvent, { tuid }))
    }

    request({ tuid }) {
        const item = this.db.get(tuid)

        if(item)
            this.send(upsertEvent, { item })
    }

    upsert({ item }) {

        if(this.db.has(item.tuid))
            this.db.updateObject(item)
        else
            this.db.addObject(item)
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