import test from "ava"
import sha1 from 'sha1'

import { Tree } from "../src/tree.js"

test("One leaf", t => {
    const tree = new Tree

    const tuid = "ffffff"
    const hash = sha1(tuid)
    
    tree.setLeafHash(tuid, hash)
    const rootHash = tree.getRootHash()

    const newTree = new Tree

    let { tuid: tuidForSync, hash: hashForSync } = newTree.syncBranch({ hash: rootHash })

    let branchForCheck = { tuid: tuidForSync, hash: hashForSync }
    let count = 0 
    while(!newTree.isSynced) {
        count++
        const branch = tree.checkBranch(branchForCheck)
        branchForCheck = newTree.syncBranch(branch)
    }

    t.is(count, 5)
    t.is(newTree.getLeavesForSync()[0], tuid)
})

test("Two leaves", t => {
    const tree = new Tree

    const hash = sha1("ffffff")
    
    tree.setLeafHash(tree.getNewTUID(), hash)
    tree.setLeafHash(tree.getNewTUID(), hash)
    const rootHash = tree.getRootHash()

    const newTree = new Tree

    let { tuid: tuidForSync, hash: hashForSync } = newTree.syncBranch({ hash: rootHash })

    let branchForCheck = { tuid: tuidForSync, hash: hashForSync }
    let count = 0 
    while(!newTree.isSynced) {
        count++
        const branch = tree.checkBranch(branchForCheck)
        branchForCheck = newTree.syncBranch(branch)
    }

    t.is(count, 3)
})