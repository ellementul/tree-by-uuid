import test from "ava"
import sha1 from 'sha1'

import { Tree } from "../src/tree.js"

test("constructor", t => {
    const tree = new Tree

    t.truthy(tree)
})

test("Get New TUID", t => {
    const tree = new Tree
    
    const rootHash = tree.getHash()
    const tuid = tree.getNewTUID()

    t.truthy(tuid)
    t.is(rootHash, tree.getHash())
})

test("Set Leaf Hash by TUID", t => {
    const tree = new Tree

    const tuid = "ffffff"
    const hash = sha1(tuid)
    const rootHash = tree.getHash()

    tree.setLeafHash(tuid, hash)

    t.is("09407b24224ef59bbeedf4d5d88be894ab8987cd", tree.getHash())
    t.is(hash, tree.getLeafHash(tuid))
    t.not(rootHash, tree.getHash())
    t.not(tree.getHash(tuid), tree.getHash())
})


test("Get Hash by TUID", t => {
    const tree = new Tree

    const tuid = tree.getNewTUID()
    const hash = sha1(tuid)

    tree.setLeafHash(tuid, hash)

    t.is(hash, tree.getLeafHash(tuid))
})


