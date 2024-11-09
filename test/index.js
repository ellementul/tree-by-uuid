import test from "ava"
import Sinon from "sinon"

import { StorageMember } from "../src/index.js"
import syncRootEvent from "../src/events/syncRootEvent.js"
import readyEvent from "../src/events/readyStorageEvent.js"
import upsertEvent from "../src/events/upsertItemEvent.js"


test("sync after connection", t => {
    const storage = new StorageMember("testStorage", true)
    storage.makeRoom()

    const callback = Sinon.fake()
    storage.subscribe(syncRootEvent, callback, "test")

    storage.onConnectRoom()

    t.true(callback.calledOnce)
    t.is(callback.args[0][0].rootHash, "da39a3ee-5e6b-5b0d-b255-bfef95601890")
})


test("ready after sync", t => {
    const storage = new StorageMember("testStorage", true)
    storage.makeRoom()
    storage.onConnectRoom()

    const callback = Sinon.fake()
    storage.subscribe(readyEvent, callback)

    storage.send(syncRootEvent, {
        storageType: "testStorage",
        rootHash: "da39a3ee-5e6b-5b0d-b255-bfef95601890",
    })

    t.true(callback.calledOnce)
})

test("add item for one storage", t => {
    const storage = new StorageMember("testStorage", true)
    storage.makeRoom()
    storage.onConnectRoom()

    const callback = Sinon.fake()
    storage.subscribe(readyEvent, callback)

    storage.send(upsertEvent)

    t.true(callback.called)
})