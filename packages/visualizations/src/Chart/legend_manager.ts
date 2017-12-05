import Legend from "./legend"
import { IState, TStateWriter, IEvents, TD3Selection } from "./typings"
import { find, forEach, invoke, reduce } from "lodash/fp"
import * as d3 from "d3-selection"
import * as $ from "jquery"

class LegendManager {

  legends: Legend[] = []
  state: IState
  stateWriter: TStateWriter
  events: IEvents
  el: TD3Selection

  constructor(state: IState, stateWriter: TStateWriter, events: IEvents, el: TD3Selection) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.el = el
    this.legends = this.initializeLegends()
  }

  initializeLegends(): Legend[] {
    let legends: Legend[] = []
    forEach.convert({ cap: false })((floats: string[], position: string): void => {
      forEach.convert({ cap: false })((el: TD3Selection, float: string): void => {
        legends.push(new Legend(this.state, position, float, el))
      })(floats)
    })(this.state.current.get("computed").canvas.legends)
    return legends
  }

  draw(): void {
    forEach((legend: Legend): void => {
      legend.draw()
    })(this.legends)
    this.arrangeTopLegends()
  }

  topLegends(): Legend[] {
    return [this.get("top", "left"), this.get("top", "right")]
  }

  get(position: string, float: string): Legend {
    return find({ float: float, position: position })(this.legends)
  }

  // If there are 2 top legends (left & right), ensure they make sensible use of the available space.
  arrangeTopLegends(): void {
    const left: Legend = this.get("top", "left"),
      right: Legend = this.get("top", "right")

    if (!right.drawn) { return }

    const width: number = this.state.current.get("config").width,
      leftNode: any = left.legend.node(),
      rightNode: any = right.legend.node(),
      leftWidth: number = left.dimensions().width,
      rightWidth: number = right.dimensions().width

    if (leftWidth + rightWidth <= width) { return }

    //
    if (leftWidth < width / 2) {
      right.legend.style("width", width - leftWidth - (rightWidth - rightNode.width()))
    } else if (rightWidth < width / 2) {
      left.legend.style("width", width - rightWidth - (leftWidth - leftNode.width()))
    } else {
      // Give the legend which takes up more space as much as possible
      const leftIsLonger: boolean = leftWidth > rightWidth,
        longer: Legend = leftIsLonger ? left : right,
        shorter: Legend = leftIsLonger ? right : left,
        longerNode: any = leftIsLonger ? leftNode : rightNode,
        shorterNode: any = leftIsLonger ? rightNode : leftNode,
        longerString: string = leftIsLonger ? "left" : "right",
        shorterString: string = leftIsLonger ? "right" : "left"

      shorter.legend.style("width", (this.state.current.get("config").width / 2) - (shorterNode.outerWidth(true) - shorterNode.width()) + "px")
      let seriesLegends: TD3Selection = shorter.legend.selectAll(".series-legend")
      let xOffset: number = this.el.node().getBoundingClientRect()[shorterString] +
        parseInt(shorter.legend.style("padding-" + shorterString), 10)
      let width: number = reduce((memo: number, legend: any): number => {
        return Math.max(memo, Math.abs(legend.getBoundingClientRect()[longerString] - xOffset))
      }, 0)((seriesLegends as any)[0])
      shorter.legend.style("width", Math.ceil(width) + "px")

      let horizontalPadding: number = longerNode.outerWidth(true) - longerNode.width()
      longer.legend.style("width", width - shorterNode.outerWidth(true) - horizontalPadding + "px")
    }
  }

  resize(): void {
    invoke("resize")(this.legends)
  }
}

export default LegendManager
