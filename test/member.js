import test from 'ava'
import sinon from "sinon"
import sha1 from 'sha1'

import { StorageMember } from '../src/member.js'
import { EventFactory, MemberFactory, Types } from '@ellementul/uee-core'
import { addEvent, checkEvent, checkRootEvent, removeEvent, requestEvent, restoreEvent, storageCreatedEvent, storageFullSyncedEvent, storageSyncedTreeEvent, storageSynchronizationEvent, syncEvent, syncRootEvent, updateEvent, upsertEvent } from '../src/events.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

test.before(t => {
    const room = new MemberFactory
    room.makeRoom()
    t.context.room = room
    t.context.items = new Map
})

test("Storage Member constructor", t => {
    const storage = new StorageMember
    t.truthy(storage)
})

test('Auto self sync without answer', async t => {
    const storageType = "Testing"
    const room = new MemberFactory
    room.makeRoom()

    const createdCallback = sinon.fake()
    room.subscribe(storageCreatedEvent, createdCallback)

    const singleStorage = new StorageMember(storageType)
    room.addMember(singleStorage)

    const syncCallback = sinon.fake()
    room.subscribe(storageSynchronizationEvent, syncCallback)

    const syncTreeCallback = sinon.fake()
    room.subscribe(storageSyncedTreeEvent, syncTreeCallback)

    const fullSyncedCallback = sinon.fake()
    room.subscribe(storageFullSyncedEvent, fullSyncedCallback)

    t.true(singleStorage.db.isSyncRoot)

    await later(100)

    t.true(singleStorage.db.isSyncRoot)

    t.false(syncCallback.calledOnce)
    t.false(syncTreeCallback.calledOnce)
    t.false(fullSyncedCallback.calledOnce)

    t.true(createdCallback.calledOnce)
    t.true(createdCallback.getCall(0).args[0].isReadyForItems)
})

test('Answer sync', async t => {
    const storageType = "Testing"
    const room = new MemberFactory
    room.makeRoom()

    const singleStorage = new StorageMember(storageType)
    room.subscribe(checkRootEvent, msg => {
        room.send(syncRootEvent, {
            storageType,
            hash: "Otherhash",
        })
    })

    room.addMember(singleStorage)

    const syncCallback = sinon.fake()
    room.subscribe(storageSynchronizationEvent, syncCallback)

    const syncTreeCallback = sinon.fake()
    room.subscribe(storageSyncedTreeEvent, syncTreeCallback)

    const fullSyncedCallback = sinon.fake()
    room.subscribe(storageFullSyncedEvent, fullSyncedCallback)

    t.true(singleStorage.db.isSyncRoot)

    await later(10)
    room.unsubscribe(checkEvent)

    t.true(syncCallback.calledOnce)
    t.false(syncTreeCallback.calledOnce)
    t.false(fullSyncedCallback.calledOnce)
})

test('Add new object', async t => {
    const room = t.context.room
    const storageType = "Testing"
    room.addMember(new StorageMember(storageType))

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    const data = "Hello UEE!"
    const hash = sha1(data)
    room.send(addEvent, { storageType, hash, data })

    await later(100)

    t.true(callback.called)
    const item = callback.getCall(0).args[0].item

    t.context.items.set(item.tuid, { ...item })
})

test('Request object', async t => {
    const storageType = "Testing"
    const room = t.context.room

    const tuid = Array.from(t.context.items.keys())[0]

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(requestEvent, { storageType, leaves: [ tuid ] })

    await later(100)

    t.true(callback.called)
})

test('Update data of object', async t => {
    const storageType = "Testing"
    const room = t.context.room

    const tuid = Array.from(t.context.items.keys())[0]
    const data = "Use UEE!"
    const hash = sha1(data)

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(updateEvent, { storageType, tuid, hash, data })

    await later(100)

    t.true(callback.called)
})

test('Remove object', async t => {
    const storageType = "Testing"
    const room = t.context.room

    const tuid = Array.from(t.context.items.keys())[0]

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(removeEvent, { storageType, tuid })

    await later(100)

    t.true(callback.called)

    const item = callback.getCall(0).args[0].item
    t.true(item.removed)
})

test('Restore object', async t => {
    const storageType = "Testing"
    const room = t.context.room

    const tuid = Array.from(t.context.items.keys())[0]

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(restoreEvent, { storageType, tuid })

    await later(100)

    t.true(callback.called)

    const item = callback.getCall(0).args[0].item
    t.false(item.removed)
})