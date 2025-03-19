import test from 'ava'
import sinon from "sinon"
import sha1 from 'sha1'

import { StorageMember } from '../src/member.js'
import { EventFactory, MemberFactory, Types } from '@ellementul/uee-core'
import { addEvent, checkEvent, removeEvent, requestEvent, restoreEvent, storageFullSyncedEvent, storageSyncedTreeEvent, storageSynchronizationEvent, syncEvent, updateEvent, upsertEvent } from '../src/events.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

test.before(t => {
    const storageType = "Testing"
    const room = new StorageMember(storageType)
    room.makeRoom()
    t.context.room = room

    const subRoom = new MemberFactory
    subRoom.makeRoom({ outEvents: [syncEvent, upsertEvent], inEvents: [checkEvent, upsertEvent] })
    room.addMember(subRoom)

    t.context.storage = new StorageMember(storageType)
    subRoom.addMember(t.context.storage)

    t.context.items = []
})

test('Synced two storages', async t => {
    t.true(t.context.storage.db.isSyncRoot)
})

test('Add new object in bottom storage', async t => {
    const room = t.context.room
    const storage = t.context.storage

    const syncCallback = sinon.fake()
    room.subscribe(storageSynchronizationEvent, syncCallback)

    let tuid
    room.subscribe(upsertEvent, event => tuid = event.item.tuid, "test")

    const data = "Hello UEE!"
    const hash = sha1(data)
    storage.send(addEvent, { hash, data })

    await later(100)
    t.context.items.push(tuid)

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(requestEvent, { leaves: [ tuid ] })

    await later(100)

    t.true(callback.called)
    t.false(syncCallback.called)
    t.true(room.db.getHashRoot() == storage.db.getHashRoot())
    t.true(room.db.get(t.context.items[0]).tuid == t.context.items[0])
})

test('Add new object in top storage', async t => {
    const room = t.context.room
    const storage = t.context.storage

    const syncCallback = sinon.fake()
    room.subscribe(storageSynchronizationEvent, syncCallback)

    let tuid
    storage.subscribe(upsertEvent, event => tuid = event.item.tuid, "test")

    const data = "Use UEE!"
    const hash = sha1(data)
    room.send(addEvent, { hash, data })

    await later(100)
    t.context.items.push(tuid)

    const callback = sinon.fake()
    storage.subscribe(upsertEvent, callback)

    storage.send(requestEvent, { leaves: [ tuid ] })

    await later(100)

    t.true(callback.called)
    t.false(syncCallback.called)
    t.true(room.db.getHashRoot() == storage.db.getHashRoot())
    t.true(storage.db.get(t.context.items[1]).tuid == t.context.items[1])
})

test('sync new storage', async t => {
    const storageType = "Testing"
    const room = t.context.room
    const storage = t.context.storage

    const newStorage = new StorageMember(storageType)
    room.addMember(newStorage)

    const syncCallback = sinon.fake()
    newStorage.subscribe(storageSynchronizationEvent, syncCallback)
    storage.subscribe(storageSynchronizationEvent, syncCallback)

    const syncTreeCallback = sinon.fake()
    room.subscribe(storageSyncedTreeEvent, syncTreeCallback)
    
    const fullSyncedCallback = sinon.fake()
    room.subscribe(storageFullSyncedEvent, fullSyncedCallback)

    t.true(storage.db.isSyncRoot)
    t.true(room.db.isSyncRoot)
    await later(100)
    
    // Sync trees
    t.true(syncCallback.calledOnce)
    t.true(syncTreeCallback.calledOnce)
    t.true(room.db.getHashRoot() == storage.db.getHashRoot())
    t.true(newStorage.db.getHashRoot() == storage.db.getHashRoot())

    // Sync leaves
    t.true(fullSyncedCallback.calledOnce)
    t.truthy(newStorage.db.get(t.context.items[0]))
    t.truthy(newStorage.db.get(t.context.items[1]))
})