import { MemberFactory } from "@ellementul/uee-core";
import syncRootEvent from "./events/syncRootEvent.js"
import readyEvent from "../src/events/readyStorageEvent.js"
import { TreeByUuid } from "./lib.js";


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid
    }

    sendSyncedRootHash(rootHash, isUpdated = false) {
        
        this.send(syncRootEvent, {
            storageType: this._storageType,
            rootHash,
            isUpdated
        })
    }

    onConnectRoom() {
        this.subscribe(syncRootEvent, (payload) => this.onSyncRoot(payload))

        const { hash } = this.db.syncRoot()
        this.sendSyncedRootHash(hash)
    }

    onSyncRoot({ isUpdated: isUpdatedOtherStorage, rootHash }) {
        
        const { hash, isUpdated } = this.db.syncRoot()
        if(rootHash == hash) {

            if(isUpdatedOtherStorage)
                this.sendSyncedRootHash(hash, isUpdated)
            else if(!isUpdated)
                this.send(readyEvent, { storageType: this._storageType })
        }
    }

    onSyncItem({ item }) {
        this.db.upsert(item)
        
        if(isUpdated)
            this.sendSyncedRootHash(hash, isUpdated)
    }
}