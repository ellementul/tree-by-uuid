import { MemberFactory } from "@ellementul/uee-core"
import { addEvent, requestEvent, updateEvent, upsertEvent } from "./events.js"
import { TreeByUuid } from "./storage.js"


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid
    }

    checkType(event) {
        return this._storageType === event.storageType
    }

    send(event, payload) {
        payload.storageType = this._storageType

        super.send(event, payload)
    }

    onConnectRoom() {
        this.subscribe(requestEvent,    event => this.checkType(event) && this.request(event))
        this.subscribe(addEvent,        event => this.checkType(event) && this.addItem(event))
        this.subscribe(upsertEvent,     event => this.checkType(event) && this.upsert(event))
        this.subscribe(updateEvent,     event => this.checkType(event) && this.update(event))
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
}