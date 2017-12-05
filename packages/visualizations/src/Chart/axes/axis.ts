// import TimeAxis from "./time_axis"
import QuantAxis from "./quant_axis"
import OrdinalAxis from "./ordinal_axis"
// import RealtimeAxis from "./realtime_axis"
import AbstractAxis from "./abstract_axis"

import { find } from "lodash/fp"
import { IObject, IState, TStateWriter, TD3Selection } from "../typings"

const config: [any, string, string][] = [
  // [TimeAxis, "time", "date"],
  [QuantAxis, "quant", "number"],
  [OrdinalAxis, "ordinal", "string"],
  // [RealtimeAxis, "realtime", "date"]
]

// Factory Class
class Axis {

  constructor(state: IState, stateWriter: TStateWriter, name: string, options: IObject = {}, elGroup: TD3Selection) {
    const type: any[] = find({ 1: options.type })(config)
    if (!type) {
      throw new Error("invalid axis type " + options.type + " specified")
    }

    let axis: AbstractAxis = new type[0](state, stateWriter, name, options, elGroup)
    return axis
  }
}

export default Axis
