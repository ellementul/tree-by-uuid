import { Types, EventFactory } from "@ellementul/uee-core"

export default EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "syncBranch",
        storageType: Types.Key.Def(),
        uuid: Types.UUID.Def(),
        length: Types.Index.Def(16),
        hash: Types.UUID.Def()
    })
)