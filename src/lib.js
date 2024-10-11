import uuidHash from "uuid-by-string"
import { parse as uuidParse } from "uuid"

const REMOVED_HASH = uuidHash("removed")
const RESTORED_HASH = uuidHash("restored")

export class TreeByUuid {
    constructor() {
        this.objects = new Map

        this.outSync = new Set
        
        this.tree = new Branches

        this.isUpdated = false
    }

    setHashOfItem(uuid, hash) {
        const uuidBytes = uuidParse(uuid)

        let branch = this.tree

        for (let i = 0; i < 14; i++) {
            const byte = uuidBytes[i]

            if(!branch[byte]) {
                branch[byte] = new Branches
            }

            branch = branch[byte]
        }

        const prevLastByte = uuidBytes[14]
        if(!branch[prevLastByte]) {
            branch[prevLastByte] = new Leaves
        }
        branch = branch[prevLastByte]

        const lastByte = uuidBytes[15]
        branch[lastByte] =  { hash }

        for (let i = 0; i < 14; i++) {
            const byte = uuidBytes[i]

            if(!branch[byte]) {
                branch[byte] = new Branches
            }

            branch = branch[byte]
        }

        this.isUpdated = true
    }

    syncHashRoot() {
        const isUpdated = this.isUpdated
        this.isUpdated = false

        return { hash: this.tree.hash, isUpdated }
    }

    getHashOfBranch(partOfUuidBytes) {
        const partLen = partOfUuidBytes.length
        let branch = this.tree

        for (let i = 0; i < partLen - 1; i++) {
            const byte = partOfUuidBytes[i]
            branch = branch[byte]
        }

        const lastByte = partOfUuidBytes[partLen - 1]

        return branch[lastByte].hash
    }

    getHashOfItem(uuid) {
        const uuidBytes = uuidParse(uuid)

        return this.getHashOfBranch(uuidBytes)
    }

    upsert(object) {
        if(!object.hash && object.data)
            throw new TypeError("Hash is empty, Data isn't")

        if(object.hash && !object.data)
            throw new TypeError("Data is empty, Hash isn't")

        if(!this.objects.has(object.uuid))
            return this._add(object)
        else
            return this._update(object)
    }

    get(uuid) {
        const { version, data } = this.objects.get(uuid)

        if(version) {
            const hash = this.getHashOfItem(uuid)
            const removed = hash === REMOVED_HASH

            return { uuid, hash, version, data, removed }
        }
        
        return
    }

    _add({ uuid, hash, version, data }) { 

        if(!version)
            version = uuidHash(uuid + hash)
        
        this.objects.set(uuid, { version, data })
        this.setHashOfItem(uuid, hash)

        return  { uuid, version }
    }

    _update({ uuid, hash, version, data }) {
        const { version: selfVersion } = this.objects.get(uuid)
        const selfHash = this.getHashOfItem(uuid)

        let isCollision = false

        if(hash == selfHash)
            return { uuid, version }

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
            this.setHashOfItem(uuid, hash)
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
            const hash = this.getHashOfItem(uuid)

            if(hash !== REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = REMOVED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.setHashOfItem(uuid, newHash)

                return { uuid, version: item.version }
            }
        }

        return null
    }

    restore(uuid) {
        if(this.objects.has(uuid)) {
            const hash = this.getHashOfItem(uuid)

            if(hash == REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = RESTORED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.setHashOfItem(uuid, newHash)

                return { uuid, version: item.version }
            }
        }

        return null
    }
}

class Branches extends Array {
    constructor() {
        super()

        this.hash = uuidHash("")
    }

    clacHash() {
        for (const item of this) {
            console.log(item)
        }
    }
}

class Leaves extends Array {
    constructor() {
        super()

        this.hash = uuidHash("")
    }

    clacHash() {

    }
}