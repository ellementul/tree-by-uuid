import Hex from 'hex-encoding'
import sha1 from 'sha1'

import { Types } from "@ellementul/uee-core"

const genRandomByte = Types.Index.Def(256).rand

export class Tree {

    constructor() {
        this.root = new Branch
        
        this.leavesForSync = []
    }

    get isSynced() {
        return !this.root.isNeedSync
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

    getLeafForSync() {
        return this.leavesForSync.pop()
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
            leafHash: branch.leafHash
        }
    }

    syncBranch({ tuid, hash, leafHash }) {
        const TUIDBytes = tuid ? Array.from(Hex.decode(tuid)) : []

        let branch = this.root

        for (let i = 0; i < TUIDBytes.length; i++) {
            const byte = TUIDBytes[i]

            if(!branch[byte])
                new Branch(branch, byte)

            branch = branch[byte]

            if(!branch.isNeedSync)
                break
        }

        if(branch.isNeedSync) {
            if(tuid && leafHash) {
                this.isNeedSyncLeaf(tuid, leafHash)
            }

            branch.isNeedSync = branch.hash != hash
        }

        if(!branch.isNeedSync && branch.parent) {
            TUIDBytes.pop()
            branch = branch.parent
        }

        return { 
            tuid:  Hex.encode(TUIDBytes), 
            hash: branch.hash,
            syncedChildren: branch.syncedChildren,
            isSynced: !branch.isNeedSync 
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

        this.hash = sha1("")

        this.leafHash = null

        this._isNeedSync = true
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