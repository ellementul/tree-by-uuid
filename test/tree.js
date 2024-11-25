import test from "ava"
import sha1 from 'sha1'

import { Types } from "@ellementul/uee-core"

import { Tree } from "../src/tree.js"

const genByte = Types.Index.Def(256).rand

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

test("Set Hash by TUID", t => {
    const tree = new Tree

    const tuid = "ffffff"
    const hash = sha1(tuid)
    const rootHash = tree.getHash()

    tree.setHash(tuid, hash)

    t.is("ed5fe06d997f4ef1d9f48382a4529af00d531987", tree.getHash())
    t.not(rootHash, tree.getHash())
})


test("Get Hash by TUID", t => {
    const tree = new Tree

    const tuid = tree.getNewTUID()
    const hash = sha1(tuid)

    tree.setHash(tuid, hash)

    t.is(hash, tree.getHash(tuid))
})

test("Load test", t => {
    const tree = new Tree
    const loadWeight = 256+128+64

    const start = Date.now()

    for (let index = 0; index < loadWeight; index++) {
        const tuid = tree.getNewTUID()
        const hash = sha1(tuid)
        tree.setHash(tuid, hash)
    }

    const end = Date.now()
    const time = end - start
    
    console.log("Inserted items:", loadWeight, "\nTime: " + time + "ms")
    t.true(time < 100)
})


