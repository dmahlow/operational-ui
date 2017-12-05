import AbstractLegend from "../utils/legend"
import { filter, find, forEach, get, groupBy, keys, map } from "lodash/fp"
import { ISeries } from "./typings"

class Legend extends AbstractLegend {

  data(): ISeries[] {
    const multipleAxes: string | undefined = this.state.current.get("computed").series.multipleAxes,
      series: ISeries[] = this.state.current.get("computed").series.series

    if (!multipleAxes && this.position === "top" && this.float === "left") {
      return filter((d: ISeries): boolean => !d.hideInLegend())(series)
    } else if (multipleAxes === "y" && this.position === "top") {
      const yAxis: string = this.float === "left" ? "y1" : "y2"
      return filter((d: ISeries): boolean => d.yAxis() === yAxis && !d.hideInLegend())(series)
    } else if (multipleAxes === "x" && this.float === "left") {
      const xAxis: string = this.position === "top" ? "x2" : "x1"
      return filter((d: ISeries): boolean => d.xAxis() === xAxis && !d.hideInLegend())(series)
    } else {
      return []
    }
  }

  dataKey(d: any): string {
    return d.key()
  }

  colorAccessor(d: any): string {
    return d.color()
  }

  labelAccessor(d: any): string {
    return d.name()
  }
}

export default Legend
