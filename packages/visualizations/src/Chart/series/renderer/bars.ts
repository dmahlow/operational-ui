import AbstractRenderer from "./abstract_renderer"
import { setRectAttributes } from "../../../utils/d3_utils"
import Events from "../../../utils/event_catalog"
import { defaults, every, extend, filter, flow, isFunction, map, sortBy } from "lodash/fp"
import * as d3 from "d3-selection"
import { IConfig, IObject } from "../../typings"

function anchor(scale: (d: any) => number, baseline: number): (d: any) => number {
  return (d: any): number => {
    let v: number = scale(d)
    return (v > baseline) ? baseline : v
  }
}

function length(scale: (d: any) => number, baseline: number): (d: any) => number {
  return (d: any): number => {
    return Math.max(Math.abs(scale(d) - baseline), 1) || 0
  }
}

function guardNaN(funcOrConst: any): any {
  let func: any = functor(funcOrConst)
  return (d: any, i: number): number => func(d, i) || 0
}

function functor(funcOrConst: any): any {
  return isFunction(funcOrConst) ? funcOrConst : () => funcOrConst
}

class Bars extends AbstractRenderer {

  accessor: string = "rect"
  barWidth: number
  discrete: any
  key: any
  type: string = "bars"

  // Initialize
  initialize(): void {
    this.barWidth = this.options.width
  }

  color(): ((d: any) => string) | string {
    return this.series.color()
  }

  // Event handlers
  // We need to get d3 element from context, can't bind onClick to this
  onMouseOver(ctx: this): (d: any, i: number) => void {
    return function(d: any, i: number): void {
      let bar: any = d3.select(this)
      ctx.mouseOver(bar, d)
    }
  }

  mouseOver(bar: any, datum: any): void {
    const color: any = functor(this.color()),
      colorHex: string = color(datum)
    let focusPoint: any
    let isNegative: boolean

    if (this.yIsBaseline()) {
      // get x and dimensions from svg element (easier than to compute offset again), make sure to cast from string
      isNegative = this.previousDraw.y(datum) === this.baseline.computed.baseline
      focusPoint = extend(
        {
          color: colorHex,
          colorHex: colorHex,
          label: this.state.current.get("config").focusFormatter(datum[this.series.dataIndeces()["x"]]),
          labelPosition: isNegative ? "below" : "above",
          width: +bar.attr("width"),
          x: +bar.attr("x"),
          y: this.previousDraw.y(datum) + (isNegative ? +bar.attr("height") : 0)
        }
      )(this.series.focusPoint(this.series.xAxis(), datum[this.series.dataIndeces()["x"]]))
    } else {
      // get y and dimensions from svg element (easier than to compute offset again), make sure to cast from string
      isNegative = this.previousDraw.x(datum) < this.baseline.computed.baseline
      focusPoint = extend(
        {
          color: colorHex,
          colorHex: colorHex,
          height: +bar.attr("height"),
          label: this.state.current.get("config").focusFormatter(datum[this.series.dataIndeces()["y"]]),
          labelPosition: isNegative ? "toLeft" : "toRight",
          x: this.previousDraw.x(datum) + (isNegative ? 0 : +bar.attr("width")),
          y: +bar.attr("y") + +bar.attr("height") / 2
        }
      )(this.series.focusPoint(this.series.yAxis(), datum[this.series.dataIndeces()["y"]]))
    }

    // During transitions, if a mouseover event is triggered on an element that is not in the new data,
    // before the bar transition has been called (i.e. before .on("mouseenter", null) has been called),
    // no focusPoint will be defined in the series -
    // this.series.hasData() returns false, so this.series.focusPoint(...) returns undefined
    if (focusPoint === undefined) { return }

    // this.state.trigger(Events.FOCUS.ELEMENT.HOVER, focusPoint)

    bar
      .classed("hover", true)
      .on("mouseleave", (): void => {
        // this.state.trigger(Events.FOCUS.ELEMENT.OUT)
        bar.classed("hover", false)
      })
  }

  // Helpers
  computeBarDimension(axis: IObject): (d: any, index: number) => number {
    const config: IConfig = this.state.current.get("config"),
      computedCanvas: any = this.state.current.get("computed").canvas
    return (d: any, i: number): number => {
      return Math.min(
        Math.max(
          axis.barSeries.find((s: IObject): boolean => s.key === this.series.key()).barDimension - config.barPadding,
          config.minBarWidth
        ),
        (this.yIsBaseline() ? computedCanvas.drawingContainerDims.width : computedCanvas.drawingContainerDims.height) * config.maxBarWidthRatio
      )
    }
  }

  computeBarTranslation(axis: IObject, barWidth: any): (d: any, i: any) => string {
    return (d: any, i: number): string => {
      let translation: number = Math.abs(functor(barWidth)(d, i) / 2 - axis.barSeries.find((s: IObject): boolean => s.key === this.series.key()).barDimension / 2)
      return this.yIsBaseline() ? "translate(" + translation + ", 0)" : "translate(0, " + translation + ")"
    }
  }

  prepareData(axis: any, scale: any, name: string): any[] {
    return flow(
      filter(this.dataFilter.bind(this)(axis, scale, name)),
      sortBy(scale)
    )(this.series.dataPoints)
  }

  // Drawing
  prepareDraw(): void {
    super.prepareDraw()

    if (!this.discrete) {
      throw new Error("bars renderer needs a discrete axis (time or ordinal)")
    }

    // Keying function for bars
    let index: number = this.discrete.index
    this.key = (d: any): string => d[index]
  }

  data(x: any, y: any): any {
    return this.yIsBaseline() ? this.prepareData(this.x, x, "x") : this.prepareData(this.y, y, "y")
  }

  getAttributes(x: (d: any) => number, y: (d: any) => number, baseline: number): any {
    // Vertical columns
    const that: any = this
    let translation: (d: any, i: number) => string
    let stacked: (d: any) => number
    let currentDraw: any

    const offset: any = (axisName: string): any => {
      const type: string = this.state.current.get("accessors").data.axes(this.state.current.get("data"))[axisName].type,
        computed: any = this.state.current.get("computed").axes[axisName].computed,
        index: number = this.series.dataIndeces()[axisName[0]]

      return type === "time"
        ? (d: any): number => computed.adjustedBarOffset(d[index], that.series.barIndex) - computed.halfTickWidth
        : computed.barSeries.find((s: IObject) => s.key === that.series.key()).barOffset - computed.halfTickWidth
    }

    if (this.yIsBaseline()) {
      let barWidth: any = this.barWidth || this.computeBarDimension(this.x)
      translation = this.computeBarTranslation(this.x, barWidth)
      // if (this.series.y.relativeIndex) {
      //   let dataIsNegative: boolean = every(map((d: any): boolean => {
      //     return d[this.series.y.runningIndex] <= 0
      //   })(this.data(x, y)))
      //   stacked = dataIsNegative
      //     ? this.axisScale(this.y.axis.computed.scale, this.series.y.relativeIndex)
      //     : this.axisScale(this.y.axis.computed.scale, this.series.y.runningIndex)
      // }
      currentDraw = {
        height: length(y, baseline),
        translation: translation,
        width: barWidth,
        x: guardNaN((d: any): number => x(d) + functor(offset(this.series.xAxis()))(d)),
        y: guardNaN(stacked || anchor(y, baseline))
      }

      // Horizontal bars
    } else {
      let barHeight: any = this.barWidth || this.computeBarDimension(this.y)
      translation = this.computeBarTranslation(this.y, barHeight)
      // if (this.series.x.relativeIndex) {
      //   let dataIsNegative: boolean = every(map((d: any): boolean => {
      //     return d[this.series.x.runningIndex] <= 0
      //   })(this.data(x, y)))
      //   stacked = dataIsNegative
      //     ? this.axisScale(this.x.axis.computed.scale, this.series.x.runningIndex)
      //     : this.axisScale(this.x.axis.computed.scale, this.series.x.relativeIndex)
      // }

      currentDraw = {
        height: barHeight,
        translation: translation,
        width: length(x, baseline),
        x: guardNaN(stacked || anchor(x, baseline)),
        y: guardNaN((d: any): number => y(d) + functor(offset(that.y.axis, that.y.index))(d))
      }
    }

    return currentDraw
  }

  getStartAttributes(x: any, y: any, baseline: any, currentDraw: any): any {
    let yIsBaseline: boolean = this.yIsBaseline()
    let xStart: ((d: any) => number) | number = yIsBaseline ? currentDraw.x : baseline
    let yStart: ((d: any) => number) | number = yIsBaseline ? baseline : currentDraw.y

    let translation: (d: any, i: number) => string = yIsBaseline
      ? this.computeBarTranslation(this.x, this.computeBarDimension(this.x))
      : this.computeBarTranslation(this.y, this.computeBarDimension(this.y))

    return defaults(currentDraw)({ translation: translation, x: xStart, y: yStart })
  }

  getCollapseAttributes(x: any, y: any, baseline: any): any {
    let yIsBaseline: boolean = this.yIsBaseline()
    // Vertical columns
    return {
      height: yIsBaseline ? 0 : 10,
      width: yIsBaseline ? 10 : 0,
      x: yIsBaseline ? this.axisScale(this.x.axis.previous.scale, this.x.index) : baseline,
      y: yIsBaseline ? baseline : this.axisScale(this.y.axis.previous.scale, this.y.index)
    }
  }

  setAttributes(selection: any, attributes: any, ctx: any, duration?: number): void {
    setRectAttributes(selection, extend({ color: ctx.color() })(attributes), duration)
    selection.attr("class", attributes.className || "")
  }

  enterSelection(data: any, attributes: any): void {
    super.enterSelection(data, attributes)

    this.el.selectAll("rect")
      .attr("transform", attributes.translation)
  }

  transitionSelection(data: any, attributes: any, duration: number, onTransitionEnd: () => void = undefined): void {
    super.transitionSelection(data, attributes, duration, onTransitionEnd)

    this.el.selectAll("rect")
      .attr("transform", attributes.translation)
  }


}

export default Bars
