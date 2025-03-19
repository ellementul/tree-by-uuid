import { EventFactory, Types } from "@ellementul/uee-core"

export function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

export const successfulColor = 'color:rgb(39, 170, 57)'
export const warnfulColor = 'color:rgb(161, 170, 39)'
export const failColor = 'color:rgb(170, 70, 39)'

export const assertLog = (title, isSuccessful) => console.log(`%c ${title}: ${!!isSuccessful}`, isSuccessful ? successfulColor : failColor)


export const loadWieght = 256
export const loadingEvent = EventFactory(Types.Object.Def({ state: "readyToLoad", loadWieght: Types.Index.Def(1024) }))
export const finishEvent = EventFactory(Types.Object.Def({ state: "SyncedTwoStorageViaPeerJs" }))