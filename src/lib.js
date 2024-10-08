import uuidHash from "uuid-by-string"
import { parse as uuidParse } from "uuid"

const REMOVED_HASH = uuidHash("removed")
const RESTORED_HASH = uuidHash("restored")

export class TreeByUuid {
    constructor() {
        this.objects = new Map

        this.outSync = new Set

        this.tree = new Branches
    }

    setHashInBranch(uuid, hash) {
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
    }

    getHashInBranch(uuid) {
        const uuidBytes = uuidParse(uuid)
        let branch = this.tree

        for (let i = 0; i < 15; i++) {
            const byte = uuidBytes[i]
            branch = branch[byte]
        }

        const lastByte = uuidBytes[15]

        return branch[lastByte].hash
    }

    upsert(object) {
        if(!this.objects.has(object.uuid))
            return this._add(object)
        else
            return this._update(object)
    }

    get(uuid) {
        const { version, data } = this.objects.get(uuid)

        if(version) {
            const hash = this.getHashInBranch(uuid)
            const removed = hash === REMOVED_HASH

            return { uuid, hash, version, data, removed }
        }
        
        return
    }

    _add({ uuid, hash, version, data }) { 

        if(!version)
            version = uuidHash(uuid + hash)
        
        this.objects.set(uuid, { version, data })
        this.setHashInBranch(uuid, hash)

        return  { uuid, version }
    }

    _update({ uuid, hash, version, data }) {
        if(version) {
            const { version: selfVersion } = this.objects.get(uuid)
            const selfHash = this.getHashInBranch(uuid)

            if(version != uuidHash(selfVersion + selfHash + hash)) { // sended version isn't new
                if(selfVersion != uuidHash(version + hash + selfHash)) // sended  version isn't old
                    uuid = uuidHash(uuid + hash) // versions isn't comparable
                else
                    return { uuid, version: selfVersion } // sended version isn't old
            }
        }
        else {
            version = newVersion
        }
            

        this.objects.set(uuid, { version, data })
        this.setHashInBranch(uuid, hash)

        return  { uuid, version }
    }

    overwrite(object) {
        return this._add(object)
    }

    remove(uuid) {
        if(this.objects.has(uuid)) {
            const hash = this.getHashInBranch(uuid)

            if(hash !== REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = REMOVED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.setHashInBranch(uuid, newHash)

                return { uuid, version: item.version }
            }
        }

        return null
    }

    restore(uuid) {
        if(this.objects.has(uuid)) {
            const hash = this.getHashInBranch(uuid)

            if(hash == REMOVED_HASH) {
                const item = this.objects.get(uuid)
                const newHash = RESTORED_HASH
                item.version = uuidHash(item.version + hash + newHash)
                this.setHashInBranch(uuid, newHash)

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