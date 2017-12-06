import AbstractRenderer from "./abstract_renderer"
import { setPathAttributes } from "../../../utils/d3_utils"
import * as d3 from "d3-selection"
import { line as d3Line } from "d3-shape"
import { extend, filter, flow, forEach, isFunction, sortBy } from "lodash/fp"

function defined(scale: any): (d?: any) => boolean {
  return isFunction(scale)
    ? (d: any): boolean => !isNaN(scale(d))
    : () => true
}

// this.options
// "interpolate" - "monotone" etc. - see d3 documentation
// "dashed" - dashed style
class Line extends AbstractRenderer {

  accessor: string = "path"
  line: (x: any, y: any) => (d: any) => string
  type: string = "line"

  initialize(): void {
    // Line path generator
    let interpolator: any = this.options.interpolate || undefined
    this.line = (x: any, y: any): any => {
      return d3Line()
        // .curve(interpolator)
        .x(x)
        .y(y)
        .defined(defined(this.yIsBaseline() ? y : x))
    }
  }

  // Workaround - we need to get d3 element from context
  onMouseOver(ctx: any): (d: any, i: number) => void {
    return function(d: any, i: number): void {
      let path: any = d3.select(this)
      ctx.mouseOver(path, d)
    }
  }

  mouseOver(path: any, data: any): void {
    path
      .classed("hover", true)
      .on("mouseout", function(): void {
        path.classed("hover", false)
      })
  }

  prepareData(axis: any, scale: any): any[] {
    // The d3 stack layout considers missing data to be = 0, which automatically closes gaps.
    // If the gaps shouldn't be closed, the relevant values need to be reset to undefined.
    if (this.series.stacked && !this.options.closeGaps) {
      flow(
        filter((d: any): boolean => d[1] === null),
        forEach((d: any): void => d[2] = d[3] = undefined)
      )(this.series.dataPoints)
    }

    // return !this.options.closeGaps && axis.options.addMissingDatapoints != null
    //   ? axis.axis.addMissingDatapoints(this.series.dataPoints, axis.index)
    //   : sortBy(scale)(this.series.dataPoints)
    return sortBy(scale)(this.series.dataPoints)
  }

  color(ctx: any): string {
    return ctx.series.colorHex
  }

  data(x: any, y: any): any {
    return this.yIsBaseline() ? [this.prepareData(this.x, x)] : [this.prepareData(this.y, y)]
  }

  getAttributes(x: (d: any) => number, y: (d: any) => number, baseline: number): any {
    // store calculations for this draw so they can be used for transition in next draw
    let currentDraw: any = {}
    currentDraw.pointsDrawn = this.series.dataPoints.length

    // If data is stacked, the running total should be used rather than the absolute value.
    // if (this.series.y.runningIndex) {
    //   currentDraw.path = this.line(x, this.axisScale(this.y.axis.computed.scale, this.series.y.runningIndex))
    // } else if (this.series.x.runningIndex) {
    //   currentDraw.path = this.line(this.axisScale(this.x.axis.computed.scale, this.series.x.runningIndex), y)
    // } else {
    currentDraw.path = this.line(x, y)
    // }

    return currentDraw
  }

  getStartAttributes(x: (d: any) => number, y: (d: any) => number, baseline: number): any {
    return { path: this.yIsBaseline() ? this.line(x, baseline) : this.line(baseline, y) }
  }

  getCollapseAttributes(x: any, y: any, baseline: any): any {
    // Need to collapse line differently depending on whether baseline is on x or y
    let axis: any = this.yIsBaseline() ? this.x : this.y
    let scale: (d: any) => number = this.axisScale(axis.axis.computed.scale, axis.index)
    return {
      opacity: 1e-6,
      path: this.yIsBaseline() ? this.line(scale, baseline) : this.line(baseline, scale)
    }
  }

  setAttributes(selection: any, attributes: any, ctx: any, duration?: number): void {
    setPathAttributes(selection, extend({ stroke: ctx.series.color() })(attributes), duration)
  }

}

export default Line
