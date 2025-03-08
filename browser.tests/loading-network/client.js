import { EventFactory, Types, MemberFactory } from "@ellementul/uee-core"

import { assertLog, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"


export function runEchoClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id')

    console.log(`%c Peers Transport client is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: false, id })

    const room = new MemberFactory
    room.makeRoom({ transport: transport })
    room.connect()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const secondEvent = EventFactory(Types.Object.Def({ system: "test2" }))

    room.subscribe(event, () => {
        assertLog("Client got message", true)
        room.send(secondEvent)
    })

    assertLog("Client loaded", true)
}