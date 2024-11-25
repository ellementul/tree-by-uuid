import { MemberFactory } from "@ellementul/uee-core";
import syncRootEvent from "./events/syncRootEvent.js"
import syncBranchEvent from "../src/events/syncBranchEvent.js"
import readyEvent from "../src/events/readyStorageEvent.js"
import upsertEvent from "../src/events/upsertItemEvent.js"
import { TreeByUuid } from "./lib.js";


export class StorageMember extends MemberFactory {
    constructor(storageType = "assets", isDebug) {
        super(isDebug)

        this._storageType = storageType

        this.db = new TreeByUuid
    }

    checkType({ storageType }) {
        // Fixed problem about not extendable type
        return this._storageType === storageType
    }

    sendSyncedRootHash(rootHash, isUpdated = false) {
        
        this.send(syncRootEvent, {
            storageType: this._storageType,
            rootHash,
            isUpdated
        })
    }

    onConnectRoom() {
        this.subscribe(syncRootEvent, (payload) => this.checkType(payload) && this.onSyncRoot(payload))
        this.subscribe(syncBranchEvent, (payload) => this.checkType(payload) && this.onSyncBranch(payload))
        this.subscribe(upsertEvent, (payload) => this.checkType(payload) && this.onSyncItem(payload))
        

        const { hash, isUpdated } = this.db.syncRoot()
        this.sendSyncedRootHash(hash, isUpdated)
    }

    onSyncRoot({ isUpdated: isUpdatedOtherStorage, rootHash }) {
        const { hash, isUpdated } = this.db.syncRoot()

        console.log("A", this._uuid, rootHash, hash, isUpdatedOtherStorage)

        if(rootHash == hash) {

            if(isUpdatedOtherStorage && !isUpdated)
                this.sendSyncedRootHash(hash, isUpdated)
            
            if(!isUpdated)
                this.send(readyEvent, { storageType: this._storageType })
        }
        else {
            // const unsyncedItems = this.db.syncBranch({ length: 0, hash: rootHash })
            // unsyncedItems.forEach(({ uuid, length, hash }) => {
            //     this.send(syncBranchEvent, {
            //         storageType: this._storageType,
            //         uuid,
            //         length,
            //         hash
            //     })
            // })
        }
    }

    onSyncBranch({ uuid, length, hash }) {
        console.log("B", this._uuid, hash, this.db.tree.root.hash)
        // if(length == 16) {
        //     const { version, hash, data } = this.db.get(uuid)

        //     this.send(upsertEvent, {
        //         storageType: this._storageType,
        //         item: { uuid, version, hash, data }
        //     })
        // }
        // else {
        //     const unsyncedItems = this.db.syncBranch({ uuid, length, hash })
            
        //     unsyncedItems.forEach(({ uuid, length, hash }) => {
        //         this.send(syncBranchEvent, {
        //             storageType: this._storageType,
        //             uuid,
        //             length,
        //             hash
        //         })
        //     })
        // }
    }

    onSyncItem({ item }) {
        this.db.upsert(item)
        const { hash, isUpdated } = this.db.syncRoot()
        
        if(isUpdated)
            this.sendSyncedRootHash(hash, isUpdated)
    }
}