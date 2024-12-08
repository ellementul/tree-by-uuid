import uuidHash from "uuid-by-string"
import { Tree } from "./tree.js"

export const REMOVED_HASH = uuidHash("removed")
export const RESTORED_HASH = uuidHash("restored")

export class TreeByUuid {
    constructor() {
        this.objects = new Map

        this.outSync = new Set
        
        this.tree = new Tree

        this._isUpdated = false
    }

    syncRoot() {
        const result = { hash: this.tree.getHash(), isUpdated: this._isUpdated }

        this._isUpdated = false

        return result
    }

    syncBranch({ tuid, hash, leafHash }) {
        return this.tree.syncBranch({ tuid, hash, leafHash })
    }

    get(tuid) {
        if(!this.objects.has(tuid))
            return null

        const { version, data, removed } = this.objects.get(tuid)
        const hash = this.tree.getLeafHash(tuid)

        return { tuid, hash, version, data, removed }
    }

    addObjectRequest({ tuid, hash }) {
        this.tree.isNeedSyncLeaf(tuid, hash)
    }

    addNewObject({ hash, data }) {
        if(!hash || !data)
            throw new TypeError("Hash or Data is empty!")

        const tuid = this.tree.getNewTUID()

        return this.addObject({ tuid, hash, data })
    }

    addObject({ tuid, hash, data }) {
        const version = uuidHash(tuid + hash)
        
        this.objects.set(tuid, { version, data })
        this.tree.setLeafHash(tuid, hash)

        return  { tuid, version }
    }

    updateData({ tuid, hash, data }) {
        const selfHash = this.tree.getLeafHash(tuid)
        const { version: selfVersion } = this.objects.get(tuid)

        if(selfHash === hash )
            return  { tuid, version: selfVersion }
        
        const version = uuidHash(selfVersion + selfHash + hash)

        this.objects.set(tuid, { version, data })
        this.tree.setLeafHash(tuid, hash)

        return  { tuid, version }
    }

    updateObject({ tuid, version, hash, data }) {
        const { version: selfVersion } = this.objects.get(tuid)

        if(selfVersion === version )
            return  { tuid, version }

        const selfHash = this.tree.getLeafHash(tuid)
        
        let isNeedUpdated = true
        let isCollision = false

        // It is not new version
        if(version != uuidHash(selfVersion + selfHash + hash)) {
            isNeedUpdated = false

            // And it is not old version
            if(selfVersion != uuidHash(version + hash + selfHash))
                isCollision = true

            version = selfVersion
        }

        if(isNeedUpdated) {
            this.objects.set(tuid, { version, data })
            this.tree.setLeafHash(tuid, hash)
        }

        return  { tuid, version, isCollision }
    }

    remove(tuid) {
        if(this.objects.has(tuid)) {
            const hash = this.tree.getLeafHash(tuid)

            const item = this.objects.get(tuid)

            if(!item.removed) {
                const newHash = REMOVED_HASH
                this.tree.setLeafHash(tuid, newHash)
                item.removed = true
                item.version = uuidHash(item.version + hash + newHash)
            }

            return { tuid, version: item.version }
        }

        return null
    }

    restore(tuid) {
        if(this.objects.has(tuid)) {
            const hash = this.tree.getLeafHash(tuid)

            const item = this.objects.get(tuid)

            if(item.removed) {
                const newHash = RESTORED_HASH
                this.tree.setLeafHash(tuid, newHash)
                item.removed = false
                item.version = uuidHash(item.version + hash + newHash)
            }

            return { tuid, version: item.version }
        }

        return null
    }
}