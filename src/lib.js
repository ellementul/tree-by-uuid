import uuidHash from "uuid-by-string"
import { Tree } from "./tree.js"

const ZERO_HASH = uuidHash("")
const REMOVED_HASH = uuidHash("removed")
const RESTORED_HASH = uuidHash("restored")

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

    syncBranch({ uuid, length, hash }) {
        return this.tree.syncBranch(uuid, length, hash)
    }

    upsert({ uuid, hash, version, data }) {
        if(!hash && data)
            throw new TypeError("Hash is empty, Data isn't")

        if(hash && !data)
            throw new TypeError("Data is empty, Hash isn't")

        if(!hash && !data) {
            data = ""
            hash = ZERO_HASH
            version = uuidHash(uuid + ZERO_HASH)
        }


        if(!this.objects.has(uuid))
            return this._add({ uuid, hash, version, data })
        else
            return this._update({ 
                uuid, 
                hash, 
                version,
                data
            })
    }

    get(uuid) {
        if(!this.objects.has(uuid))
            return {}

        const { version, data } = this.objects.get(uuid)

        if(version) {
            const hash = this.tree.getHash(uuid)
            const removed = hash === REMOVED_HASH

            return { uuid, hash, version, data, removed }
        }
    }

    _add({ uuid, hash, version, data }) { 

        if(!version)
            version = uuidHash(uuid + hash)
        
        this.objects.set(uuid, { version, data })
        this.tree.setHash(uuid, hash)

        this._isUpdated = true

        return  { uuid, version }
    }

    _update({ uuid, hash, version, data }) {
        const { version: selfVersion } = this.objects.get(uuid)
        const selfHash = this.tree.getHash(uuid)
        
        let isNeedUpdated = true
        let isCollision = false

        if(!version)
            version = uuidHash(selfVersion + selfHash + hash)

        if (hash == ZERO_HASH && version == uuidHash(uuid + ZERO_HASH))
            isNeedUpdated = false

        // It is not new version
        if(version != uuidHash(selfVersion + selfHash + hash) && selfVersion != uuidHash(uuid + ZERO_HASH)) {
            isNeedUpdated = false

            // And it is not old version
            if(selfVersion != uuidHash(version + hash + selfHash)) {
                isCollision = true
                version = selfVersion
            }
        }

        if(isNeedUpdated && version != selfVersion) {
            this.objects.set(uuid, { version, data })
            this.tree.setHash(uuid, hash)

            this._isUpdated = true
        }

        return  { uuid, version, isCollision }
    }

    overwrite(object) {
        if(!object.hash && object.data)
            throw new TypeError("Hash is empty, Data isn't")

        if(object.hash && !object.data)
            throw new TypeError("Data is empty, Hash isn't")

        return this._add(object)
    }

    remove(uuid) {
        if(this.objects.has(uuid)) {
            const hash = this.tree.getHash(uuid)

            if(hash !== REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = REMOVED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.tree.setHash(uuid, newHash)

                this._isUpdated = true

                return { uuid, version: item.version }
            }
        }

        return null
    }

    restore(uuid) {
        if(this.objects.has(uuid)) {
            const hash = this.tree.getHash(uuid)

            if(hash == REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = RESTORED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.tree.setHash(uuid, newHash)

                this._isUpdated = true

                return { uuid, version: item.version }
            }
        }

        return null
    }
}