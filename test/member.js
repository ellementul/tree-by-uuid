import test from 'ava'
import sinon from "sinon"
import sha1 from 'sha1'

import { StorageMember } from '../src/member.js'
import { EventFactory, MemberFactory, Types } from '@ellementul/uee-core'
import { addEvent, requestEvent, updateEvent, upsertEvent } from '../src/events.js'

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

    room.send(requestEvent, { storageType, tuid })

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

    t.truthy(room)
})