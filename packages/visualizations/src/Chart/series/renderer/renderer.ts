// import Area from "./area"
// import BarLine from "./bar_line"
// import Bars from "./bars"
// import EventFlag from "./event_flag"
import Line from "./line"
// import Points from "./points"
// import Range from "./range"
// import TextLabels from "./textlabels"
import { TD3Selection, IObject, IState } from "../../typings"

// Factory Class
class Renderer {

  constructor(state: IState, series: any, type: string, el: TD3Selection, options: IObject) {
    switch (type) {
      // case "area":
      //   return new Area(state, series, options)
      // case "bar_line":
      //   return new BarLine(state, series, options)
      // case "bars":
      //   return new Bars(state, series, options)
      // case "event_flag":
      //   return new EventFlag(state, series, options)
      case "line":
        return new Line(state, series, el, options)
      // case "points":
      //   return new Points(state, series, options)
      // case "range":
      //   return new Range(state, series, options)
      // case "textlabels":
      //   return new TextLabels(state, series, options)
      default:
        throw new Error("invalid render type '" + type + "' specified")
    }
  }

}

export default Renderer
