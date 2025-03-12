import { EventFactory, Types, MemberFactory, connectionEvent } from "@ellementul/uee-core"

import { assertLog, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"

import { StorageMember } from "../../src/member.js"
import { checkEvent, syncEvent, requestEvent, upsertEvent } from "../../src/events.js"


export function runEchoClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id')

    console.log(`%c Peers Transport client is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: false, id })

    const room = new MemberFactory
    // room.receiveAll = console.log
    room.makeRoom({ transport: transport })
    room.connect()

    const storage = new StorageMember
    storage.makeRoom({
        inEvents: [connectionEvent, checkEvent, syncEvent, requestEvent, upsertEvent],
        outEvents: [checkEvent, syncEvent, requestEvent, upsertEvent]
    })

    room.addMember(storage)

    assertLog("Client loaded", true)
}