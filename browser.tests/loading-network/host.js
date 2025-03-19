import sha1 from 'sha1'
import { Types, MemberFactory, connectionEvent, disconnectionEvent } from "@ellementul/uee-core"

import { assertLog, finishEvent, later, loadingEvent, loadWieght, successfulColor } from './test.utils.js'
import { PeerJsTransport } from "@ellementul/uee-transport-peerjs"
import { StorageMember } from "../../src/member.js"
import { addEvent, checkEvent } from "../../src/events.js"

export async function runTests() {
    const id = Types.UUID.Def().rand()

    console.log(`%c PeerJs Member test is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: true, id, options: {
		host: "localhost",
		port: 9000,
		path: "/myapp",
	} })

    const url = new URL(location)
    url.pathname = "/client"
    url.searchParams.set("id", id)

    document.body.insertAdjacentHTML("beforeend", `
        <a target="_blank" href="${url}">Ссылка на клиент</a>
    `)

    const room = new MemberFactory
    room.makeRoom({ transport })

    const storage = new StorageMember
    room.addMember(storage)

    fillStorage(storage, loadWieght)

    room.subscribe(connectionEvent, async ({ isHost }) => {
        assertLog("Host connected to clinet", isHost)

        const start = Date.now()
        let msgCounter = 0

        room.send(loadingEvent, { loadWieght })

        room.receiveAll = () => msgCounter++
        storage.subscribe(finishEvent, () => {
            assertLog("Syncronization finish", true)

            const end = Date.now()
            const time = end - start
            console.log("loadWieght: ", loadWieght, "; Time: ", time, "; Messages: ", msgCounter)
        })
    })

    room.subscribe(disconnectionEvent, async () => {
        assertLog("Host disconnected", true)
    })

    await later(100)

    assertLog("Local host syncronization finish", storage.db.isSyncRoot)

    room.connect()
}

function fillStorage(storage, loadWieght) {
    const data = { loadItems: [] }

    for (let i = 0; i < loadWieght; i++) {
        data.loadItems.push("" + i)
        const hash = sha1(data)
        storage.send(addEvent, { hash, data })
    }
}