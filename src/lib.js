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

        this.isUpdated = false
    }

    upsert({ uuid, hash, version, data }) {
        if(!hash && data)
            throw new TypeError("Hash is empty, Data isn't")

        if(hash && !data)
            throw new TypeError("Data is empty, Hash isn't")

        if(!hash && !data) {
            data = ""
            hash = ZERO_HASH
        }


        if(!this.objects.has(uuid)) {
            return this._add({ uuid, hash, version, data })
        }
        else {
            const { version: selfVersion } = this.objects.get(uuid)

            if(selfVersion == uuidHash(uuid + ZERO_HASH))
                return this._add({ uuid, hash, version, data })
            else
                return this._update({ uuid, hash, version, data, selfVersion })
        }
            
    }

    get(uuid) {
        const { version, data } = this.objects.get(uuid)

        if(version) {
            const hash = this.tree.getHash(uuid)
            const removed = hash === REMOVED_HASH

            return { uuid, hash, version, data, removed }
        }
        
        return
    }

    _add({ uuid, hash, version, data }) { 

        if(!version)
            version = uuidHash(uuid + hash)
        
        this.objects.set(uuid, { version, data })
        this.tree.setHash(uuid, hash)

        return  { uuid, version }
    }

    _update({ uuid, hash, version, selfVersion, data }) {
        
        const selfHash = this.tree.getHash(uuid)

        let isCollision = false

        if(version) {
            const isNewVersion = version == uuidHash(selfVersion + selfHash + hash)

            if(!isNewVersion) {
                const isOldVersion = selfVersion == uuidHash(version + hash + selfHash)

                if(!isOldVersion)
                    isCollision = true
                else
                    version = selfVersion
            }
        }
        else {
            version = uuidHash(selfVersion + selfHash + hash)
        }
            

        if(!isCollision && version != selfVersion) {
            this.objects.set(uuid, { version, data })
            this.tree.setHash(uuid, hash)
        }
        

        return  { uuid, version, isCollision, selfHash, receivedHash: hash }
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

                return { uuid, version: item.version }
            }
        }

        return null
    }
}