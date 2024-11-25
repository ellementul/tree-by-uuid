import Hex from 'hex-encoding'
import sha1 from 'sha1'

import { Types } from "@ellementul/uee-core"

const genByte = Types.Index.Def(256).rand

export class Tree {

    constructor() {
        this.root = new Branches 
    }

    getNewTUID() {
        let branch = this.root
        const TUIDBytes = []

        while(true) {
            const randomByte = genByte()
            TUIDBytes.push(randomByte)

            if(!branch[randomByte])
                break

            branch = branch[randomByte]
        }

        const TUID = Hex.encode(TUIDBytes)
        return TUID
    }

    getHash(tuid) {
        if(!tuid)
            return this.root.hash

        const TUIDBytes = Hex.decode(tuid)
        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                return

            branch = branch[byte]
        }

        return branch.hash
    }

    setHash(tuid, hash) {
        const TUIDBytes = Hex.decode(tuid)

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                branch[byte] = new Branches(branch)

            branch = branch[byte]
        }

        branch.setHash(hash)
    }

    
}


class Branches extends Array {
    constructor(parent) {
        super()

        this.parent = parent || null

        this.hash = sha1("")
    }

    clacHash() {
        let unitedString = ""

        for (let i = 0; i < this.length; i++)
            unitedString += this[i] ? this[i].hash : ""

        this.hash = sha1(unitedString)

        if(this.parent)
            this.parent.clacHash()
    }

    setHash(hash) {
        if(!this.parent)
            throw new Error("You can't set hash for root!")

        this.hash = hash
        this.parent.clacHash()
    }
}