import { IConfig, IObject, IState, TD3Selection } from "../../typings"
import * as d3 from "d3-selection"
import { easeLinear } from "d3-ease"
import "d3-transition"
import { forEach } from "lodash/fp"
import * as styles from "./styles"

abstract class AbstractRenderer {

  accessor: string
  baseline: any
  discrete: any
  drawn: boolean = false
  el: any
  key: (d: any) => string
  options: any
  previousDraw: any
  series: any
  state: IState
  type: string
  x: any
  y: any

  constructor(state: IState, series: any, el: TD3Selection, options: any = {}) {
    this.state = state
    this.series = series
    this.el = this.appendSeriesEl(el)
    this.options = options
    this.initialize()
  }

  appendSeriesEl(el: TD3Selection): TD3Selection {
    return el.append("g")
      .attr("class", "series")
      .attr("data-sid", this.series.key)
  }

  initialize(): void {
    return
  }

  yIsBaseline(): boolean {
    return this.baseline.axis[0] === "y"
  }

  // We need to get d3 element from context, can't bind onClick to this
  onClick(ctx: any): (d: any, i: number) => void {
    return function(d: any, i: number): void {
      // @TODO
      // ctx.state.trigger("select:element", ctx.series, d)
    }
  }

  onMouseOver(ctx: any): any {
    return
  }

  // Return function that can be plugged into d3
  axisScale(scale: any, index: number): (d: any) => number {
    return (d: any): number => scale(d[index])
  }

  draw(): void {
    // Make mapping available in a comfortable way:
    const computedAxes: IObject = this.state.current.get("computed").axes
    forEach.convert({ cap: false })((axis: IObject, key: string): void => {
      if (axis.computed.baseline) {
        this.baseline = axis
        this.baseline.axis = key
      }
      if (axis.computed.discrete) {
        this.discrete = axis
        this.discrete.axis = key
      }
    })(computedAxes)
    this.x = computedAxes[this.series.xAxis()].computed
    this.y = computedAxes[this.series.yAxis()].computed
    this.prepareDraw()
    if (this.drawn) {
      this.updateDraw()
    } else {
      this.appendGroup()
      this.initialDraw()
    }
  }

  prepareDraw(): void {
    if (!this.baseline) {
      throw new Error(this.type + " renderer needs at least one axis with baseline (quant axis)")
    }
  }

  appendGroup(): void {
    // svg element
    this.el.append("svg:g")
      .attr("class", (styles as any)[this.type])
  }

  drawingScales(): [(d: any) => number, (d: any) => number, number] {
    const computedAxes: IObject = this.state.current.get("computed").axes
    const x: (d: any) => number = this.axisScale(this.x.scale, this.series.dataIndeces().x)
    const y: (d: any) => number = this.axisScale(this.y.scale, this.series.dataIndeces().y)
    let baseline: number = this.baseline.computed.baseline
    return [x, y, baseline]
  }

  abstract data(x: any, y: any): any

  dataFilter(axis: IObject, scale: any, name: string): any {
    const index: number = this.series.dataIndeces()[name]
    return axis.discrete
      ? (d: any[]): boolean => axis.domain.indexOf(d[index]) > -1
      : (d: any[]): boolean => d[index] > axis.domain[0] && d[index] < axis.domain[1]
  }

  abstract getAttributes(x: any, y: any, baseline: any): any

  abstract getStartAttributes(x: any, y: any, baseline: any, currentDraw: any): any

  abstract getCollapseAttributes(x: any, y: any, baseline: any): any

  abstract setAttributes(selection: any, attributes: any, ctx: any, duration?: number, onTransitionEnd?: any): void

  enterSelection(data: any, attributes: any): void {
    this.el
      .select(`g.${(styles as any)[this.type]}`)
      .selectAll(this.accessor)
      .data(data, this.key)
      .enter()
      .append("svg:" + this.accessor)
      .call(this.setAttributes, attributes, this)
      .on("click", this.onClick(this))
      .on("mouseenter", this.onMouseOver(this))
  }

  transitionSelection(data: any, attributes: any, duration: number, onTransitionEnd: () => void = undefined): void {
    let selection: TD3Selection = this.el
      .select(`g.${(styles as any)[this.type]}`)
      .selectAll(this.accessor)

    selection.enter().merge(selection)
      .transition()
      .duration(duration)
      .ease(easeLinear)
      .call(this.setAttributes, attributes, this, duration, onTransitionEnd)
      // .each("end", onTransitionEnd)
  }

  exitSelection(data: any, attributes: any, duration: number): void {
    this.el.selectAll(this.accessor)
      .data(data, this.key)
      .exit()
      .call(this.setAttributes, attributes, this, duration)
      .remove()
  }

  updateSelection(previousAttributes: any, currentAttributes: any, data: any, duration: number): void {
    this.el.selectAll(this.accessor)
      .data(data, this.key)
      .call(this.setAttributes, previousAttributes, this)

    if (this.accessor === "path") {
      this.transitionSelection(data, currentAttributes, duration)
    } else {
      this.exitSelection(data, currentAttributes, duration)
      this.enterSelection(data, previousAttributes)
      this.transitionSelection(data, currentAttributes, duration)
    }
  }

  initialDraw(redraw: boolean = false): void {
    let [x, y, baseline]: any = this.drawingScales()
    const config: IConfig = this.state.current.get("config")
    // only half the duration available if second part of a redraw
    let duration: number = config.duration
    if (redraw) { duration *= config.durationRedraw }

    let data: any = this.data(x, y)
    let currentDraw: any = this.getAttributes(x, y, baseline)
    let startAttributes: any = this.getStartAttributes(x, y, baseline, currentDraw)

    this.enterSelection(data, startAttributes)
    this.transitionSelection(data, currentDraw, duration)
    this.previousDraw = currentDraw
    this.drawn = true
  }

  updateDraw(): void {
    // Can't transition to new data - redraw
    (!this.x.axis.computed.transition || !this.y.axis.computed.transition) ? this.reDraw() : this.transitionDraw()
  }

  // collapse drawing to old baseline, then draw it from scratch
  reDraw(): void {
    let [x, y, baseline]: any = this.drawingScales()
    const config: IConfig = this.state.current.get("config")
    // only half the time available as we need to do the initial draw again
    let duration: number = config.duration * config.durationCollapse
    let collapseAttributes: any = this.getCollapseAttributes(x, y, baseline)

    // As we are animating more than one element, and the 'end' event is fired for each one,
    // we have to make sure that our callback to redraw is only run once
    let done: boolean = false
    this.el.selectAll(this.accessor)
      .transition()
      .duration(duration)
      .ease(easeLinear)
      .call(this.setAttributes, collapseAttributes, this)
      .each("end", (): void => {
        if (done) { return }
        done = true
        this.close()
        this.appendGroup()
        this.initialDraw(true)
      })
  }

  transitionDraw(): void {
    let [x, y, baseline]: any = this.drawingScales()
    let duration: number = this.state.current.get("config").duration

    let data: any = this.data(x, y)
    let currentDraw: any = this.getAttributes(x, y, baseline)

    this.updateSelection(this.previousDraw, currentDraw, data, duration)

    this.previousDraw = currentDraw
  }

  close(): void {
    if (this.drawn) {
      this.el.remove()
      this.drawn = false
    }
  }
}

export default AbstractRenderer
