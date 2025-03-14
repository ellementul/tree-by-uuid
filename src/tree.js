import sha1 from 'sha1'
import { Hex } from "./hex.js"

import { Types } from "@ellementul/uee-core"

const genRandomByte = Types.Index.Def(256).rand

export const EMPTY_HASH = sha1("")

export class Tree {

    constructor() {
        this.root = new Branch
        this.root.isNeedSync = false
        
        this.leavesForSync = []
    }

    get isSynced() {
        return !this.root.isNeedSync
    }

    resyncRoot() {
        this.root.isNeedSync = true
    }

    getNewTUID(prefix) {
        let branch = this.root

        const TUIDBytes = prefix ? Hex.decode(prefix) : []

        let i = 0
        while(true) {
            let byte
            
            if(i < TUIDBytes.length){
                byte = TUIDBytes[i]
                i += 1
            }
            else {
                byte = genRandomByte()
                TUIDBytes.push(byte)
            }

            if(!branch[byte])
                break

            branch = branch[byte]
        }

        const TUID = Hex.encode(TUIDBytes)
        return TUID
    }

    getRootHash() {
        return this.root.hash
    }

    getLeavesForSync() {
        const leaves = [...this.leavesForSync]
        this.leavesForSync = []
        return leaves
    }

    getLeafHash(tuid) {
        const TUIDBytes = Hex.decode(tuid)
        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                return

            branch = branch[byte]
        }

        return branch.leafHash
    }

    checkBranch({ tuid, hash, syncedChildren = [] }) {
        const TUIDBytes = tuid ? Array.from(Hex.decode(tuid)) : []

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++)
            branch = branch[TUIDBytes[i]]

        const isNeedSync = branch.hash != hash

        if(isNeedSync) {
            const childIndex = branch.randomChildIndex(syncedChildren)
            if(childIndex !== null) {
                TUIDBytes.push(childIndex)
                branch = branch[childIndex]
            }
        }
        else if(branch.parent) {
            TUIDBytes.pop()
            branch = branch.parent
        }

        return {
            tuid:  Hex.encode(TUIDBytes),
            hash: branch.hash,
            leafHash: branch.leafHash,
            size: branch.size
        }
    }

    syncBranch({ tuid, hash, leafHash, size }) {
        const TUIDBytes = tuid ? Array.from(Hex.decode(tuid)) : []

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                new Branch(branch, byte)

            branch = branch[byte]
        }

        branch.isNeedSync = branch.hash != hash

        if(tuid && leafHash) {
            this.isNeedSyncLeaf(tuid, leafHash)
        }

        if(!branch.isNeedSync && branch.parent) {
            TUIDBytes.pop()
            branch = branch.parent
        }

        return { 
            tuid:  Hex.encode(TUIDBytes), 
            hash: branch.hash,
            syncedChildren: branch.syncedChildren
        }
    }

    isNeedSyncLeaf(tuid, leafHash) {
        const TUIDBytes = Hex.decode(tuid)

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++)
            branch = branch[TUIDBytes[i]]

        if(branch.leafHash !== leafHash) {
            this.leavesForSync.push(tuid)
            branch.setLeafHash(leafHash)
        }
    }

    setLeafHash(tuid, leafHash) {
        const TUIDBytes = Hex.decode(tuid)

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                new Branch(branch, byte)

            branch = branch[byte]
        }

        branch.setLeafHash(leafHash)
    }

    
}


class Branch extends Array {
    constructor(parent, index) {
        super()

        if(parent) {
            this.parent = parent
            this.index = index
            this.parent[index] = this
            this.parent.children.push(index)
            this.parent.children.sort((a, b) => a - b)
        }

        this.children = []
        this.syncedChildren = []

        this.hash = EMPTY_HASH

        this.leafHash = ""

        this._isNeedSync = true
    }

    get size() {
        return this.children.length
    }

    get isNeedSync() {
        return this._isNeedSync
    }

    set isNeedSync(isNotSync) {
        this._isNeedSync = isNotSync

        if(!isNotSync && this.parent)
            this.parent.syncedChildren.push(this.index)
    }

    get isLeaf() {
        return !!this.leaveHash
    }

    randomChildIndex(excludeIndexes) {
        if(this.children.length == 0)
            return null

        const excludeChildren = new Set(excludeIndexes)
        const children = this.children.filter(child => !excludeChildren.has(child))

        if(children.length == 0)
            return null

        if(children.length == 1)
            return children[0]

        const randomChildIndex = Types.Index.Def(children.length).rand()

        return children[randomChildIndex]
    }

    clacHash() {
        let unitedString = this.leafHash ? this.leafHash : ""

        if(this.children.length > 0)
            this.children.forEach(index => unitedString += this[index].hash)

        this.hash = sha1(unitedString)

        if(this.parent)
            this.parent.clacHash()
    }

    setLeafHash(hash) {
        if(!this.parent)
            throw new Error("You can't set leaf hash for root!")

        this.leafHash = hash
        this.clacHash()
    }
}