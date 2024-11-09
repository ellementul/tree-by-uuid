import { Types, EventFactory } from "@ellementul/uee-core"

export default EventFactory(
    Types.Object.Def({
        system: "storage",
        action: "upsertItem",
        storageType: Types.Key.Def(),
        item: Types.Any.Def()
    })
)