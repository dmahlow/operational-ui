import AbstractRenderer from "./abstract_renderer"
import TextLabelFormat from "../../../utils/textlabel_formatter"
import { setTextAttributes } from "../../../utils/d3_utils"
import { extend, filter, isFunction } from "lodash/fp"

function guardNaN(funcOrConst: any): (d: any, i: number) => number {
  let func: any = isFunction(funcOrConst) ? funcOrConst : () => funcOrConst
  return (d: any, i: number): number => {
    return func(d, i) || 0
  }
}

class TextLabels extends AbstractRenderer {

  type: string = "textlabels"
  discrete: any
  mappings: any
  key: any
  accessor: string = "text"

  // Helpers
  // Gives coordinates of each series when stacked
  getPosition(axisName: "x" | "y", scale: (d: any) => number): (d: any) => number {
    // return this.series[axisName].runningIndex
    //   ? this.axisScale(this[axisName].axis.computed.scale, this.series[axisName].runningIndex)
    //   : scale
    return scale
  }

  // Calculate offset of text labels from rendered points.
  calculateOffset(): number {
    // return this.series.hasRenderer("bars")
    //   ? this.state.options.textlabels.offset.default
    //   : this.state.options.textlabels.offset[this.series.hasRenderer("points") ? "points" : "default"]
    return this.state.current.get("config").textlabels.offset.default
  }

  // The labels need to be offset according to series type: if bars, the labels need to be centred.
  calculateStart(axis: any, scale: (d: any) => number): (d: any) => number {
    // if (this.series.hasRenderer("bars")) {
    //   let computed: any = axis.axis.computed
    //   let barIndex: number = this.series.barIndex
    //   let barCenterOffset: number = computed.barOffset.rangeBand() / 2
    //   let offset: any = axis.axis.type === "time"
    //     ? function(d: any): number { return computed.adjustedBarOffset(d[axis.index], barIndex) - computed.tickWidth / 2 }
    //     : computed.barOffset(barIndex) - computed.tickWidth / 2
    //   return function(d: any): number { return Math.round(scale(d)) + d3.functor(offset)(d) + barCenterOffset }
    // } else {
      return scale
    // }
  }

  labelText(): (d: any) => string {
    // return (d: any): string => this.series.displayFormatter()(d[this.baseline.index])
    const index: number = this.series.dataIndeces()[this.baseline.axis[0]]
    return (d: any): string => this.state.current.get("config").numberFormatter(d[index])
  }

  data(x: any, y: any): any {
    return filter((d: any): boolean => d[1] != null)(this.series.dataPoints)
  }

  getAttributes(x: (d: any) => number, y: (d: any) => number, baseline: number): any {
    // store calculations for this draw so they can be used for transition in next draw
    let currentDraw: any = {}
    let rotate: number
    let offsetLabel: number = this.calculateOffset()

    if (this.yIsBaseline()) {
      currentDraw.x = guardNaN(this.calculateStart(this.x, x))
      currentDraw.y = guardNaN(this.getPosition("y", y))
      rotate = this.state.current.get("config").textlabels.rotate.vertical
      currentDraw.textAnchor = TextLabelFormat.rotatedTextAnchor(
        this.state.current.get("computed").canvas.drawingHeight, currentDraw.y, offsetLabel, this.y.index, rotate
      )
      // dx and dy need to be calculated based on offsetLabel, textAnchor, x & y positions and rotation
      // If textlabels are on only bars or bar lines, they should be centered.
      // let center: boolean = this.series.hasOnlyRenderer(["bars", "bar_line"])
      let center: boolean = false
      currentDraw.dx = TextLabelFormat.rotatedDx(currentDraw.textAnchor, offsetLabel, rotate, center)
      currentDraw.dy = TextLabelFormat.rotatedDy(currentDraw.textAnchor, offsetLabel, rotate, center)
    } else {
      currentDraw.x = guardNaN(this.getPosition("x", x))
      currentDraw.y = guardNaN(this.calculateStart(this.y, y))
      rotate = this.state.current.get("config").textlabels.rotate.horizontal
      let labelPosition: any = TextLabelFormat.horizontalLabelPosition(
        this.state.current.get("computed").canvas.drawingWidth,
        currentDraw.x,
        offsetLabel,
        this.x.index
      )
      currentDraw.textAnchor = function(d: any): string { return labelPosition(d, this).textAnchor }
      currentDraw.dx = function(d: any): number { return labelPosition(d, this).dx }
      currentDraw.dy = ".35em"
    }

    currentDraw.transform = function(d: any): string {
      return "rotate(" + rotate + " " + currentDraw.x(d) + " " + currentDraw.y(d) + ")"
    }

    currentDraw.labelText = this.labelText()

    return currentDraw
  }

  getStartAttributes(x: any, y: any, baseline: any, currentDraw: any): any {
    // Need to position labels from different side depending on whether baseline is on x or y
    return {
      x: this.yIsBaseline() ? currentDraw.x : baseline,
      y: this.yIsBaseline() ? baseline : currentDraw.y
    }
  }

  getCollapseAttributes(x: any, y: any, baseline: any): any {
    // Need to collapse points differently depending on whether baseline is on x or y
    return {
      x: this.yIsBaseline() ? this.axisScale(this.x.axis.previous.scale, this.x.index) : baseline,
      y: this.yIsBaseline() ? baseline : this.axisScale(this.y.axis.previous.scale, this.y.index)
    }
  }

  prepareDraw(): void {
    super.prepareDraw()
    // Keying function for text labels
    // let index: number = this.discrete ? this.discrete.index : this.mappings.x.index
    let index: number = this.series.dataIndeces()[this.baseline.axis[0]]
    this.key = function(d: any): string { return d[index] }
  }

  setAttributes(selection: any, attributes: any, ctx: any, duration?: number): void {
    selection.call(setTextAttributes, extend({ labelText: ctx.labelText() })(attributes), duration)
  }

}

export default TextLabels
