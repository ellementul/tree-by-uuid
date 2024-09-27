import test from "ava"
import getUuidByString from "uuid-by-string"

import { TreeByUuid } from "../src/lib.js"

test.before("constructor", t => {
    t.context.storage = new TreeByUuid
    t.context.uuids = [getUuidByString("u-u-i-d")]
})

test("constructor", t => {
    t.truthy(t.context.storage)
})

test("add new object", t => {
    const storage = t.context.storage

    const data = "Hello!"

    const uuid = t.context.uuids[0]
    const hash = getUuidByString(data)
    const version = getUuidByString(uuid + hash)

    const result = storage.upsert({
        uuid,
        hash,
        data
    })

    t.is(result.uuid, uuid)
    t.is(result.version, version)
})

test("get object", t => {
    const storage = t.context.storage

    const data = "Hello!"

    const uuid = t.context.uuids[0]

    const object = storage.get(uuid)

    t.is(object.uuid, uuid)
    t.is(object.data, data)
    t.falsy(object.removed)
})

test("update object", t => {
    const storage = t.context.storage

    const newData = "Bay!"

    const object = storage.get(t.context.uuids[0])
    const newHash = getUuidByString(newData)
    const newVersion = getUuidByString(object.version + object.hash + newHash)

    const result = storage.upsert({
        uuid: object.uuid,
        hash: newHash,
        version: newVersion,
        data: newData
    })
    t.is(result.uuid, t.context.uuids[0])
    t.is(result.version, newVersion)

    const updatedObject = storage.get(t.context.uuids[0])
    t.is(updatedObject.data, newData)
})

test("remove object", t => {
    const storage = t.context.storage

    const uuid = t.context.uuids[0]

    const result = storage.remove(uuid)

    t.truthy(result.uuid)
    t.truthy(result.version)


    const object = storage.get(uuid)

    t.true(object.removed)
})


test("update object with wrong version", t => {
    const storage = t.context.storage

    const newData = "BadBoy!"

    const object = storage.get(t.context.uuids[0])
    const newHash = getUuidByString(newData)
    const newVersion = getUuidByString(newHash)

    const result = storage.upsert({
        uuid: object.uuid,
        hash: newHash,
        version: newVersion,
        data: newData
    })
    t.not(result.uuid, t.context.uuids[0])
    t.is(result.version, newVersion)

    const updatedObject = storage.get(result.uuid)
    t.is(updatedObject.data, newData)
})


test("overwrite object", t => {
    const storage = t.context.storage

    const newData = "CoolBoy!"

    const object = storage.get(t.context.uuids[0])
    const newHash = getUuidByString(newData)
    const newVersion = getUuidByString(newHash)

    const result = storage.overwrite({
        uuid: object.uuid,
        hash: newHash,
        version: newVersion,
        data: newData
    })
    t.is(result.uuid, t.context.uuids[0])
    t.is(result.version, newVersion)

    const updatedObject = storage.get(result.uuid)
    t.is(updatedObject.data, newData)
})