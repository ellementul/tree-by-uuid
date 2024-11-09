import { Types, EventFactory } from "@ellementul/uee-core"

export default EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "syncRoot",
        storageType: Types.Key.Def(),
        rootHash: Types.UUID.Def(),
        isUpdated: Types.Bool.Def()
    })
)