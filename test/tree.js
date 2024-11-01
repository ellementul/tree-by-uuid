import test from "ava"
import uuidHash from "uuid-by-string"

import { Tree } from "../src/tree.js"

test("constructor", t => {
    const tree = new Tree

    t.truthy(tree)
})


test("Set Hash to Item", t => {
    const tree = new Tree

    const uuid = uuidHash("item uuid")
    const hash = uuidHash("item hash")
    const rootHash = "4deb9803-d2b8-53b9-bd3f-013a784db50d"

    tree.setHash(uuid, hash)

    t.is(tree.getHash(uuid), hash)
    t.is(tree.getHash(), rootHash)

    const uuid2 = uuidHash("item uuid 2")
    const hash2 = uuidHash("item hash 2")
    const rootHash2 = "69adee7f-bacd-500c-abd2-023d167ac154"

    tree.setHash(uuid2, hash2)

    t.false(uuid == uuid2)
    t.is(tree.getHash(uuid2), hash2)
    t.is(tree.getHash(), rootHash2)
})

test("Diff Hash to Item", t => {
    const tree = new Tree

    const uuid = "4deb9803-d2b8-53b9-bd3f-013a784db50d"
    const uuid2 = "4deb9803-d2b8-53b9-bd3f-013a784db61d"
    const hash = uuidHash("item hash")

    tree.setHash(uuid, hash)

    const hash1 = tree.getHash(uuid, 1)
    const hash2 = tree.getHash(uuid, 2)
    const hash3 = tree.getHash(uuid, 3)
    const hash4 = tree.getHash(uuid, 4)
    const hash5 = tree.getHash(uuid, 5)
    const hash6 = tree.getHash(uuid, 6)
    const hash7 = tree.getHash(uuid, 7)
    const hash8 = tree.getHash(uuid, 8)
    const hash9 = tree.getHash(uuid, 9)
    const hash10 = tree.getHash(uuid, 10)
    const hash11 = tree.getHash(uuid, 11)
    const hash12 = tree.getHash(uuid, 12)
    const hash13 = tree.getHash(uuid, 13)
    const hash14 = tree.getHash(uuid, 14)
    const hash15 = tree.getHash(uuid, 15)

    tree.setHash(uuid2, hash)

    t.false(tree.getHash(uuid, 1) == hash1)
    t.false(tree.getHash(uuid, 2) == hash2)
    t.false(tree.getHash(uuid, 3) == hash3)
    t.false(tree.getHash(uuid, 4) == hash4)
    t.false(tree.getHash(uuid, 5) == hash5)
    t.false(tree.getHash(uuid, 6) == hash6)
    t.false(tree.getHash(uuid, 7) == hash7)
    t.false(tree.getHash(uuid, 8) == hash8)
    t.false(tree.getHash(uuid, 9) == hash9)
    t.false(tree.getHash(uuid, 10) == hash10)
    t.false(tree.getHash(uuid, 11) == hash11)
    t.false(tree.getHash(uuid, 12) == hash12)
    t.false(tree.getHash(uuid, 13) == hash13)
    t.false(tree.getHash(uuid, 14) == hash14)
    t.true(tree.getHash(uuid, 15) == hash15)

    console.log(tree.getHash(uuid, 1), hash1)
})