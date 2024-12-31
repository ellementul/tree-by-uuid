import { Types, EventFactory } from "@ellementul/uee-core"

export const addEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "addItem",
        storageType: Types.Key.Def(),
        hash: Types.Key.Def(),
        data: Types.Any.Def()
    })
)

export const requestEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "requestItem",
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def()
    })
)

export const upsertEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "upsertItem",
        storageType: Types.Key.Def(),
        item: Types.Object.Def({}, true)
    })
)

export const updateEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "updateData",
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def(),
        hash: Types.Key.Def(),
        data: Types.Any.Def()
    })
)