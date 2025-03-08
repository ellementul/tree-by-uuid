import test from 'ava'
import sinon from "sinon"
import sha1 from 'sha1'

import { StorageMember } from '../src/member.js'
import { EventFactory, MemberFactory, Types } from '@ellementul/uee-core'
import { addEvent, checkEvent, removeEvent, requestEvent, restoreEvent, syncEvent, updateEvent, upsertEvent } from '../src/events.js'

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
    subRoom.makeRoom({ outEvents: [upsertEvent], inEvents: [upsertEvent] })
    room.addMember(subRoom)

    t.context.storage = new StorageMember(storageType)
    subRoom.addMember(t.context.storage)

    t.context.items = []
})

test('Add new object in bottom storage', async t => {
    const room = t.context.room
    const storage = t.context.storage

    let tuid
    room.subscribe(upsertEvent, event => tuid = event.item.tuid, "test")

    const data = "Hello UEE!"
    const hash = sha1(data)
    storage.send(addEvent, { hash, data })

    await later(100)
    t.context.items.push(tuid)

    const callback = sinon.fake()
    room.subscribe(upsertEvent, callback)

    room.send(requestEvent, { tuid })

    await later(100)

    t.true(callback.called)
})

test('Add new object in top storage', async t => {
    const room = t.context.room
    const storage = t.context.storage

    let tuid
    storage.subscribe(upsertEvent, event => tuid = event.item.tuid, "test")

    const data = "Use UEE!"
    const hash = sha1(data)
    room.send(addEvent, { hash, data })

    await later(100)
    t.context.items.push(tuid)

    const callback = sinon.fake()
    storage.subscribe(upsertEvent, callback)

    storage.send(requestEvent, { tuid })

    await later(100)

    t.true(callback.called)
})

test('sync new storage', async t => {
    const storageType = "Testing"
    const room = t.context.room
    const newStorage = new StorageMember(storageType)
    room.addMember(newStorage)

    await later(100)

    const callback = sinon.fake()
    newStorage.subscribe(upsertEvent, callback)

    newStorage.send(requestEvent, { tuid: t.context.items[0] })
    newStorage.send(requestEvent, { tuid: t.context.items[1] })

    await later(100)

    t.true(callback.called)
    t.is(t.context.items[0], callback.getCall(0).firstArg.item.tuid)
    t.is(t.context.items[1], callback.getCall(1).firstArg.item.tuid)
})