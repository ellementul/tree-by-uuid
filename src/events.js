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

export const removeEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "removeItem",
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def()
    })
)

export const restoreEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "restoreItem",
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def()
    })
)

export const checkEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "checkBranch",
        storageId: Types.UUID.Def(),
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def(),
        hash: Types.Key.Def(),
        syncedChildren: Types.Any.Def(),
        checkRoot: Types.Bool.Def()
    })
)

export const syncEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "syncBranch",
        storageId: Types.UUID.Def(),
        storageType: Types.Key.Def(),
        tuid: Types.Key.Def(),
        hash: Types.Key.Def(),
        leafHash: Types.Key.Def(),
        size: Types.Index.Def(256)
    })
)