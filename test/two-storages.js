import test from "ava"
import getUuidByString from "uuid-by-string"

import { TreeByUuid } from "../src/storage.js"

test("Self sync", t => {
    const storage = new TreeByUuid
    
    const data = "Hello!"
    const hash = getUuidByString(data)

    storage.addNewObject({
        hash,
        data
    })

    storage.addNewObject({
        hash,
        data
    })

    const firstSyncRoot = storage.syncHashRoot(storage.getHashRoot()+"resync")

    t.false(storage.isSyncRoot)
    t.false(storage.isNeedSyncLeaves)

    let branchForCheck = firstSyncRoot
    let count = 0 
    while(!storage.isSyncRoot) {
        count++
        const branch = storage.checkBranch(branchForCheck)
        branchForCheck = storage.syncBranch(branch)
    }

    t.is(count, 1)
    t.false(storage.isNeedSyncLeaves)
})

test("One leaf", t => {
    const storage = new TreeByUuid
    
    const data = "Hello!"
    const hash = getUuidByString(data)

    storage.addNewObject({
        hash,
        data
    })

    const newStorage = new TreeByUuid
    const firstSyncRoot = newStorage.syncHashRoot(storage.getHashRoot())

    t.false(newStorage.isSyncRoot)
    t.false(newStorage.isNeedSyncLeaves)

    let branchForCheck = firstSyncRoot
    let count = 0 
    while(!newStorage.isSyncRoot) {
        count++
        const branch = storage.checkBranch(branchForCheck)
        branchForCheck = newStorage.syncBranch(branch)
    }

    t.is(count, 2)
    t.true(newStorage.isNeedSyncLeaves)
    
    const neededLeaves = newStorage.getNeededLeaves()
    
    neededLeaves.forEach(tuid => {
        newStorage.addObject(storage.get(tuid))
    })

    t.true(newStorage.isSyncRoot)
    t.false(newStorage.isNeedSyncLeaves)
})

test("Tree leaves, two for sync", t => {
    const storage = new TreeByUuid
    
    const data = "Hello!"
    const hash = getUuidByString(data)

    storage.addNewObject({
        hash,
        data
    })

    storage.addNewObject({
        hash,
        data
    })

    const syncedLeaf = storage.addNewObject({
        hash,
        data
    })

    const newStorage = new TreeByUuid
    newStorage.addObject(storage.get(syncedLeaf.tuid))
    const firstSyncRoot = newStorage.syncHashRoot(storage.getHashRoot())

    t.false(newStorage.isSyncRoot)
    t.false(newStorage.isNeedSyncLeaves)

    let branchForCheck = firstSyncRoot
    let count = 0 
    while(!newStorage.isSyncRoot) {
        count++
        const branch = storage.checkBranch(branchForCheck)
        branchForCheck = newStorage.syncBranch(branch)
    }

    t.true(newStorage.isNeedSyncLeaves)
    
    const neededLeaves = newStorage.getNeededLeaves()
    
    neededLeaves.forEach(tuid => {
        newStorage.addObject(storage.get(tuid))
    })

    t.true(newStorage.isSyncRoot)
    t.false(newStorage.isNeedSyncLeaves)
})