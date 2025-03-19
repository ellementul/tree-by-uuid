import { EventFactory, Types, MemberFactory, connectionEvent } from "@ellementul/uee-core"

import { assertLog, finishEvent, later, loadingEvent, loadWieght, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"

import { StorageMember } from "../../src/member.js"
import { checkEvent, syncEvent, requestEvent, upsertEvent, checkRootEvent, syncRootEvent } from "../../src/events.js"

export async function runEchoClient() {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id')

    console.log(`%c Peers Transport client is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: false, id,  options: {
		host: "localhost",
		port: 9000,
		path: "/myapp",
	} })

    const room = new MemberFactory
    room.makeRoom({ transport: transport })

    const storage = new StorageMember
    storage.makeRoom({
        inEvents: [connectionEvent, syncRootEvent, syncEvent, upsertEvent],
        outEvents: [checkRootEvent, checkEvent, requestEvent]
    })

    room.addMember(storage)

    await later(100)

    assertLog("Local syncronization client finish", storage.db.isSyncRoot)

    room.connect()

    room.subscribe(connectionEvent, async ({ isHost }) => {
        assertLog("Client connected to host", !isHost)

        let lastTimeCheck = Date.now()
        const syncTimemarks = []

        room.subscribe(checkEvent, () => {
            syncTimemarks.push(Date.now() - lastTimeCheck)
            lastTimeCheck = Date.now()
        })

        let counter = 0
        let lastTime = Date.now()

        room.subscribe(upsertEvent, async () => {
            counter++
            console.log("step: ", counter, "/", loadWieght, "; time: ", Date.now() - lastTime)
            lastTime = Date.now()

            if(counter == loadWieght)
                room.send(finishEvent)
            
        }, "Counter")
    })

    
}