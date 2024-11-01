import uuidHash from "uuid-by-string"
import { parse as uuidParse } from "uuid"

export class Tree {

    constructor() {
        this.root = new Branches 
    }

    setHash(uuid, hash) {
        const uuidBytes = uuidParse(uuid)

        let branch = this.root

        for (let i = 0; i < 14; i++) {
            const byte = uuidBytes[i]

            if(!branch[byte]) {
                branch[byte] = new Branches(branch)
            }

            branch = branch[byte]
        }

        const prevLastByte = uuidBytes[14]
        if(!branch[prevLastByte]) {
            branch[prevLastByte] = new Leaves(branch)
        }
        branch = branch[prevLastByte]

        const lastByte = uuidBytes[15]
        branch[lastByte] = hash

        branch.clacHash()
    }

    getHash(uuid, len) {
        if(!uuid)
            return this.root.hash

        const uuidBytes = uuidParse(uuid)

        const partLen = len || uuidBytes.length
        let branch = this.root

        for (let i = 0; i < partLen - 1; i++) {
            const byte = uuidBytes[i]
            branch = branch[byte]
        }

        const lastByte = uuidBytes[partLen - 1]

        return branch[lastByte].hash || branch[lastByte]
    }
}


class Branches extends Array {
    constructor(parent) {
        super()

        this.parent = parent || null

        this.hash = uuidHash("")
    }

    clacHash() {
        let unitedString = ""

        for (let i = 0; i < this.length; i++)
            unitedString += this[i] ? this[i].hash : ""

        this.hash = uuidHash(unitedString)

        if(this.parent)
            this.parent.clacHash()
    }
}

class Leaves extends Array {
    constructor(parent) {
        super()

        this.parent = parent || null

        this.hash = uuidHash("")
    }

    clacHash() {

        let unitedString = ""

        for (let i = 0; i < this.length; i++)
            unitedString += this[i] ? this[i] : ""

        this.hash = uuidHash(unitedString)

        if(this.parent)
            this.parent.clacHash()
    }
}