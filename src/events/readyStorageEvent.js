import { Types, EventFactory } from "@ellementul/uee-core"

export default EventFactory(
    Types.Object.Def({
        system: "storage",
        storageType: Types.Key.Def(),
        state: "ready",
    })
)