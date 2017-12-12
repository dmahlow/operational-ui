import AbstractLegend from "../utils/legend"
import { filter, find, forEach, get, groupBy, keys, map } from "lodash/fp"
import { ISeries, IObject } from "./typings"

class Legend extends AbstractLegend {

  data(): ISeries[] {
    return this.state.current.get("computed").series.dataForLegend[this.position][this.float]
  }

  dataKey(d: IObject): string {
    return d.key
  }

  colorAccessor(d: IObject): string {
    return d.color
  }

  labelAccessor(d: IObject): string {
    return d.name
  }
}

export default Legend
