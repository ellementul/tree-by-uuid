import { MemberFactory } from "@ellementul/uee-core"
import { addEvent, checkEvent, removeEvent, requestEvent, restoreEvent, syncEvent, updateEvent, upsertEvent } from "./events.js"
import { TreeByUuid } from "./storage.js"


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid

        this.isReady = false
    }

    checkType(event) {
        return this._storageType === event.storageType
    }

    send(event, payload) {
        payload.storageType = this._storageType

        super.send(event, payload)
    }

    init() {
        this.subscribe(requestEvent,    event => this.checkType(event) && this.request(event))
        this.subscribe(addEvent,        event => this.checkType(event) && this.addItem(event))
        this.subscribe(upsertEvent,     event => this.checkType(event) && this.upsert(event))
        this.subscribe(updateEvent,     event => this.checkType(event) && this.update(event))
        this.subscribe(removeEvent,     event => this.checkType(event) && this.remove(event))
        this.subscribe(restoreEvent,    event => this.checkType(event) && this.restore(event))

        this.send(checkEvent, {
            tuid: "",
            hash: this.db.getHashRoot(),
            syncedChildren: []
        })

        this.subscribe(syncEvent, event => this.checkType(event) && this.sync(event))
        this.subscribe(checkEvent, event => this.checkType(event) && this.check(event))
    }

    onMakeRoom() {
        if(this.isReady) return

        this.isReady = true
        this.init()
    }

    onJoinRoom() {
        if(this.isReady) return

        this.isReady = true
        this.init()
    }

    sync({ tuid, hash, leafHash }) {
        if(this.db.isEmptyHash(hash))
            return

        if(this.db.isSyncRoot)
            return

        const branchToCheck = this.db.syncBranch({ tuid, hash, leafHash })

        if(!this.db.isSyncRoot)
            this.send(checkEvent, branchToCheck)
    }

    check({ tuid, hash, syncedChildren }) {
        this.send(syncEvent, this.db.checkBranch({ tuid, hash, syncedChildren }))
    }

    request({ tuid }) {
        const item = this.db.get(tuid)

        if(item)
            this.send(upsertEvent, { item })
    }

    addItem({ hash, data }) {

        const { tuid } = this.db.addNewObject({ hash, data })
        const item = this.db.get(tuid)

        this.send(upsertEvent, { item })
    }

    upsert({ item }) {

        if(this.db.has(item.tuid))
            this.db.updateObject(item)
        else
            this.db.addObject(item)
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