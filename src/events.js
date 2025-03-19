import { Types, EventFactory } from "@ellementul/uee-core"

// Events about main state of storage
export const storageCreatedEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        state: "Created",
        isReadyForItems: Types.Bool.Def(),
        storageType: Types.Key.Def()
    })
)

export const storageSynchronizationEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        state: "Synchronization",
        storageType: Types.Key.Def()
    })
)

export const storageSyncedTreeEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        state: "SyncedTree",
        storageType: Types.Key.Def()
    })
)

export const storageFullSyncedEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        state: "FullSynced",
        storageType: Types.Key.Def()
    })
)

// Actions to create and update items in storage
export const addEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "addItem",
        storageType: Types.Key.Def(),
        hash: Types.Key.Def(),
        data: Types.Any.Def()
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

// Synchronization tuids set between storages
export const checkRootEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "checkRoot",
        storageId: Types.UUID.Def(),
        storageType: Types.Key.Def(),
        hash: Types.Key.Def()
    })
)

export const syncRootEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "syncRoot",
        storageId: Types.UUID.Def(),
        storageType: Types.Key.Def(),
        hash: Types.Key.Def(),
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
        syncedChildren: Types.Any.Def()
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


// Sync items between storages
export const requestEvent = EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "requestItem",
        storageType: Types.Key.Def(),
        leaves: Types.Array.Def(Types.Any.Def(), 50, false)
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

