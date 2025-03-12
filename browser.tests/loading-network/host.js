import sha1 from 'sha1'
import { Types, MemberFactory, disconnectionEvent } from "@ellementul/uee-core"

import { assertLog, later, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"
import { StorageMember } from "../../src/member.js"
import { addEvent } from "../../src/events.js"

export async function runTests() {
    const id = Types.UUID.Def().rand()

    console.log(`%c PeerJs Member test is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: true, id })

    const url = new URL(location)
    url.pathname = "/client"
    url.searchParams.set("id", id)

    document.body.insertAdjacentHTML("beforeend", `
        <a target="_blank" href="${url}">Ссылка на клиент</a>
    `)

    const room = new MemberFactory
    // room.receiveAll = console.log
    room.makeRoom({ transport })
    room.connect()

    const storage = new StorageMember
    room.addMember(storage)

    fillStorage(storage)

    room.subscribe(disconnectionEvent, async () => {
        assertLog("Host disconnected", true)
    })
}

function fillStorage(storage) {
    const data = "Hello UEE!"
    const hash = sha1(data)
    storage.send(addEvent, { hash, data })
}