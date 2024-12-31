import test from "ava"
import sha1 from 'sha1'

import { REMOVED_HASH, RESTORED_HASH, TreeByUuid } from "../src/storage.js"

test.before("constructor", t => {
    t.context.storage = new TreeByUuid
})

test("constructor", t => {
    t.truthy(t.context.storage)
})

test("add new object", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const result = storage.addNewObject({
        hash,
        data
    })

    const version = sha1(result.tuid + hash)
    t.is(result.version, version)

    const object = storage.get(result.tuid)
    t.is(object.tuid, result.tuid)
    t.is(object.version, result.version)
    t.is(object.hash, hash)
    t.is(object.data, data)
})

test("get object is not existed", t => {
    const storage = t.context.storage

    const uuid = sha1("")

    const object = storage.get(uuid)

    t.is(null, object)
})

test("update data", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const newData = "Bay!"
    const newHash = sha1(newData)

    const updateResult = storage.updateData({
        tuid,
        hash: newHash,
        data: newData
    })

    const newVersion = sha1(version + hash + newHash)
    t.is(updateResult.version, newVersion)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, newVersion)
    t.is(object.hash, newHash)
    t.is(object.data, newData)
})

test("update object", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const newData = "Bay!"
    const newHash = sha1(newData)
    const newVersion = sha1(version + hash + newHash)

    const updateResult = storage.updateObject({
        tuid,
        version: newVersion,
        hash: newHash,
        data: newData
    })
    
    t.is(updateResult.version, newVersion)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, newVersion)
    t.is(object.hash, newHash)
    t.is(object.data, newData)
})

test("update object:collision", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const newData = "Bay!"
    const newHash = sha1(newData)
    const newVersion = sha1(version + hash + newHash + "for collision")

    const updateResult = storage.updateObject({
        tuid,
        version: newVersion,
        hash: newHash,
        data: newData
    })
    
    t.is(updateResult.version, version)
    t.true(updateResult.isCollision)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, version)
    t.is(object.hash, hash)
    t.is(object.data, data)
})

test("update object:older_version", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const newData = "Bay!"
    const newHash = sha1(newData)
    const newVersion = sha1(version + hash + newHash)

    storage.updateObject({
        tuid,
        version: newVersion,
        hash: newHash,
        data: newData
    })

    const oldUpdateResult = storage.updateObject({
        tuid,
        version,
        hash,
        data
    })
    
    t.is(oldUpdateResult.version, newVersion)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, newVersion)
    t.is(object.hash, newHash)
    t.is(object.data, newData)
})

test("remove object", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const removedVersion = sha1(version + hash + REMOVED_HASH)
    const result = storage.remove(tuid)
    
    t.is(result.version, removedVersion)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, removedVersion)
    t.is(object.hash, REMOVED_HASH)
    t.is(object.data, data)
    t.true(object.removed)
})

test("restore object", t => {
    const storage = t.context.storage

    const data = "Hello!"
    const hash = sha1(data)

    const { tuid, version } = storage.addNewObject({
        hash,
        data
    })

    const result = storage.remove(tuid)

    const restoreVersion = sha1(result.version + REMOVED_HASH + RESTORED_HASH)
    const restoreResult = storage.restore(tuid)
    
    t.is(restoreResult.version, restoreVersion)

    const object = storage.get(tuid)
    t.is(object.tuid, tuid)
    t.is(object.version, restoreVersion)
    t.is(object.hash, RESTORED_HASH)
    t.is(object.data, data)
    t.false(object.removed)
})

test("SelfSync", t => {
    const storage = t.context.storage

    t.false(storage.isSyncRoot)

    storage.syncHashRoot(storage.getHashRoot())

    t.true(storage.isSyncRoot)
})