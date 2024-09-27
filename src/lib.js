import uuidHash from "uuid-by-string"
import { parse as uuidParse } from "uuid"

export class TreeByUuid {
    constructor(hashFunction) {
        this.hashing = hashFunction || uuidHash

        this.objects = new Map
    }

    get(uuid) {
        return this.objects.get(uuid)
    }

    upsert(object) {
        if(!this.objects.has(object.uuid))
            return this.add(object)
        else
            return this.update(object)
    }

    add(object) {
        object.version = this.hashing(object.uuid + object.hash)
        object.uuidBytes = uuidParse(object.uuid)
        this.objects.set(object.uuid, object)

        return  { uuid: object.uuid, version: object.version }
    }

    update(object) {
        const oldObject = this.objects.get(object.uuid)
        const newVersion = this.hashing(oldObject.version + oldObject.hash + object.hash)

        if(!object.version)
            object.version = newVersion

        if(object.version !== newVersion) {
            const newUuid = this.hashing(object.uuid + object.hash)
            object.uuid = newUuid
            object.uuidBytes = uuidParse(object.uuid)
        }

        this.objects.set(object.uuid, object)

        return  { uuid: object.uuid, version: object.version }
    }

    overwrite(object) {
        if(!object.version)
            object.version = this.hashing(object.uuid + object.hash)

        this.objects.set(object.uuid, object)

        return  { uuid: object.uuid, version: object.version }
    }

    remove(uuid) {
        if(this.objects.has(uuid)) {
            const object = this.objects.get(uuid)
            object.removed = true

            return { uuid, version: object.version }
        }

        return null
    }
}