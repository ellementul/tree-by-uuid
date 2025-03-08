import sinon from "sinon"
import { EventFactory, Types, MemberFactory, connectionEvent, disconnectionEvent } from "@ellementul/uee-core"

import { assertLog, later, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"

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
    room.makeRoom({ transport })
    room.connect()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const secondEvent = EventFactory(Types.Object.Def({ system: "test2" }))
    const callback = sinon.fake()

    room.subscribe(secondEvent, callback)

    room.subscribe(connectionEvent, async () => {
        assertLog("Host send message", true)
        room.send(event)

        await later(100)

        assertLog("Host got message", callback.called)
    })

    room.subscribe(disconnectionEvent, async () => {
        assertLog("Host disconnected", true)
    })
}