import test from "ava"
import sha1 from 'sha1'

import getUuidByString from "uuid-by-string"

import { Tree } from "../src/tree.js"
import { TreeByUuid } from "../src/storage.js"

test.serial("Load test of inserting", t => {
    const tree = new Tree
    const loadWeight = 1024

    const start = Date.now()

    for (let index = 0; index < loadWeight; index++) {
        const tuid = tree.getNewTUID()
        const hash = sha1(tuid)
        tree.setLeafHash(tuid, hash)
    }

    const end = Date.now()
    const time = end - start
    
    t.log("Inserted items:", loadWeight, "\nTime: " + time + "ms")
    t.true(time < 1000)
})

test.serial("Load test of sync", t => {

    const tree = new Tree
    const loadWeight = 1024

    for (let index = 0; index < loadWeight; index++) {
        const tuid = tree.getNewTUID()
        const hash = sha1(tuid)
        tree.setLeafHash(tuid, hash)
    }
    const rootHash = tree.getRootHash()

    const newTree = new Tree
    let { tuid: tuidForSync, hash: hashForSync } = newTree.syncBranch({ hash: rootHash })

    const start = Date.now()

    let branchForCheck = { tuid: tuidForSync, hash: hashForSync }
    let countCalls = 0
    while(!newTree.isSynced) {
        const branch = tree.checkBranch(branchForCheck)
        branchForCheck = newTree.syncBranch(branch)

        countCalls++
    }

    const end = Date.now()
    const time = end - start
    
    t.log("Synced items:", loadWeight, " Calls count: ", countCalls, " Time: " + time + "ms")
    t.true(time < 1000)
})

test.serial("Add items to storage", t => {
    const storage = new TreeByUuid
    
    const data = "Hello!"
    const hash = getUuidByString(data)

    const loadWeight = 1024

    const start = Date.now()

    for (let index = 0; index < loadWeight; index++) {
        storage.addNewObject({
            hash,
            data
        })
    }

    const end = Date.now()
    const time = end - start
    
    t.log("Added items:", loadWeight, " Time: " + time + "ms")
    t.true(time < 1000)
})

test.serial("Load test of sync two storage", t => {
    const storage = new TreeByUuid
    
    const data = "Hello!"
    const hash = getUuidByString(data)

    const loadWeight = 1024

    for (let index = 0; index < loadWeight; index++) {
        storage.addNewObject({
            hash: getUuidByString(hash + index),
            data
        })
    }

    const newStorage = new TreeByUuid

    const start = Date.now()

    const firstSyncRoot = newStorage.syncHashRoot(storage.getHashRoot())

    let branchForCheck = firstSyncRoot
    let countCalls = 0 

    while(!newStorage.isSyncRoot) {
        const branch = storage.checkBranch(branchForCheck)
        branchForCheck = newStorage.syncBranch(branch)
        
        countCalls++
    }
    
    const neededLeaves = newStorage.getNeededLeaves()
    
    neededLeaves.forEach(tuid => {
        newStorage.addObject(storage.get(tuid))
    })

    const end = Date.now()
    const time = end - start
    
    t.log("Synced items:", loadWeight, " Calls count: ", countCalls, " Time: " + time + "ms")
    t.true(time < 1000)
})