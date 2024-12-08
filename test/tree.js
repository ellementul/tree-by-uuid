import test from "ava"
import sha1 from 'sha1'

import { Tree } from "../src/tree.js"

test("constructor", t => {
    const tree = new Tree

    t.truthy(tree)
})

test("Get New TUID", t => {
    const tree = new Tree
    
    const rootHash = tree.getRootHash()
    const tuid = tree.getNewTUID()

    t.truthy(tuid)
    t.is(rootHash, tree.getRootHash())
})

test("Get New TUID by Prefix", t => {
    const tree = new Tree
    
    const rootHash = tree.getRootHash()
    const prefix = "ffe1"
    const tuid = tree.getNewTUID(prefix)

    t.is(prefix, tuid)
    t.is(rootHash, tree.getRootHash())
})

test("Set Leaf Hash by TUID", t => {
    const tree = new Tree

    const tuid = "ffffff"
    const hash = sha1(tuid)
    const rootHash = tree.getRootHash()

    tree.setLeafHash(tuid, hash)

    t.is("09407b24224ef59bbeedf4d5d88be894ab8987cd", tree.getRootHash())
    t.is(hash, tree.getLeafHash(tuid))
    t.not(rootHash, tree.getRootHash())
})


test("Get Hash by TUID", t => {
    const tree = new Tree

    const tuid = tree.getNewTUID()
    const hash = sha1(tuid)

    tree.setLeafHash(tuid, hash)

    t.is(hash, tree.getLeafHash(tuid))
})


