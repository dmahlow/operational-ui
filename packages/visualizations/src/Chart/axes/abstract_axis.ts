// import AxisUtils from "../../utils/axis_utils"
// import d3Utils from "../../utils/d3_utils"
import * as d3 from "d3-selection"
import "d3-transition"
import { easeLinear } from "d3-ease"
import { scaleBand as d3ScaleBand } from "d3-scale"
import { range as d3Range } from "d3-array"
import { setLineAttributes, setTextAttributes } from "../../utils/d3_utils"
import { IConfig, IObject, IState, TStateWriter, TD3Selection } from "../typings"
import { defaults, forEach, last, map, reduce } from "lodash/fp"
import * as styles from "./styles"

let sideMapping: {} = {
  "x2": "top",
  "x1": "bottom",
  "y1": "left",
  "y2": "right"
}

abstract class AbstractAxis {

  baseline: boolean
  // Initially nothing has been computed (this becomes previous in first compute call)
  computed: any = {}
  dataType: string
  discrete: boolean
  drawn: boolean = false
  el: TD3Selection
  elGroup: TD3Selection
  name: string
  previous: any
  state: IState
  type: string
  userConfigured: boolean
  hasSpaceForFlags: boolean = false
  stateWriter: TStateWriter

  constructor(state: IState, stateWriter: TStateWriter, name: string, options: any = {}, elGroup: TD3Selection) {
    this.state = state
    this.stateWriter = stateWriter
    this.name = name
    this.type = options.type
    this.elGroup = elGroup
    this.updateOptions(options)
  }

  updateOptions(options: any): void {
    return
  }

  compute(args?: any): void {
    this.previous = this.computed

    let computed: any = {}

    computed.range = this.computeRange()
    computed.rangeDirection = this.computeRangeDirection(computed.range)
    computed.width = this.computeWidth(computed.range)
    computed.baseline = this.baseline
    computed.discrete = this.discrete

    this.computeAxisInformation(computed, args)
    this.computed = computed
    this.previous = defaults(this.computed)(this.previous)
    this.stateWriter(["computed"], this.computed)
  }

  data(): any[] {
    return this.state.current.get("computed").series.axes[this.name].data
  }

  orientation(): string {
    return this.name.match(/x|y/)[0]
  }

  tickClass(tickValue: any, index: number): string {
    return ""
  }

  ruleClass(ruleValue: number, index: number): string {
    return ""
  }

  axisPosition(): [number, number] {
    const drawingContainerDims: IObject = this.state.current.get("computed").canvas.drawingContainerDims,
      axisDims: any = this.axisDimensions()

    switch (this.name) {
      case "x1":
        return [0, drawingContainerDims.height - axisDims.height]
      case "x2":
        return [0, axisDims.height]
      case "y1":
        return [axisDims.width, 0]
      case "y2":
        return [drawingContainerDims.width - axisDims.width, 0]
      default:
        return
    }
  }

  axisDimensions(): any {
    return this.el.node().getBoundingClientRect()
  }

  // Drawing
  draw(): void {
    // Only render the axis if it has data.
    this.data().length > 0
      ? (this.drawn ? this.updateDraw() : this.initialDraw())
      : this.close()
    this.stateWriter(["dimensions"], this.axisDimensions())
  }

  initialDraw(): void {
    // svg element
    this.el = this.elGroup.append("svg:g")
      .attr("class", "axis " + this.type + "-axis " + this.name)
      // .attr("transform", "translate(" + this.axisPosition().join(",") + ")")

    // Background rect for component hover
    this.el.append("svg:rect")
      .attr("class", styles.rect)

    // Border
    this.el.append("svg:line")
      .attr("class", styles.border)
      .call(setLineAttributes, { x1: 0, x2: 0, y1: 0, y2: 0 })

    this.updateDraw()

    this.drawn = true
  }

  border(): IObject {
    const range: [number, number] = this.computeRange(),
      isXAxis: boolean = this.orientation() === "x"

    return {
      x1: isXAxis ? range[0] : 0,
      x2: isXAxis ? range[1] : 0,
      y1: isXAxis ? 0 : range[0],
      y2: isXAxis ? 0 : range[1] - this.state.current.get("config").y1.minTopOffsetTopTick
    }
  }

  updateDraw(): void {
    // Short
    const config: IConfig = this.state.current.get("config"),
      duration: number = config.duration,
      tickOffset: number = (config as any)[this.name].tickOffset,
      drawingContainerDims: IObject = this.state.current.get("computed").canvas.drawingContainerDims,
      attributes: any = this.getAttributes(),
      startAttributes: any = this.getStartAttributes(attributes)

    // Tick selection
    let ticks: TD3Selection = this.el.selectAll(`text.${styles.tick}`)
      .data(this.computed.ticks, this.tickMapper())

    ticks.enter().append("svg:text")
      .attr("class", (d: string | number, i: number): string => {
        return `${styles.tick}  ${this.tickClass(d, i)}`
      })
      .call(setTextAttributes, startAttributes)
      .merge(ticks)
      .attr("class", (d: string | number, i: number): string => {
        return `${styles.tick}  ${this.tickClass(d, i)}`
      })
      .call(setTextAttributes, attributes, duration)

    ticks.exit()
      .transition()
      .duration(duration)
      .ease(easeLinear)
      .call(setTextAttributes, defaults(attributes)({ opacity: 1e6 }))
      .remove()

    // Axis position
    this.el.transition()
      .duration(duration)
      .ease(easeLinear)
      .attr("transform", "translate(" + this.axisPosition().join(",") + ")")

    this.el.select(`line.${styles.border}`)
      .call(setLineAttributes, this.border(), duration)
  }

  getAttributes(): any {
    const config: IConfig = this.state.current.get("config"),
      scale: any = this.computed.scale,
      data: (string | number)[] = this.computed.ticks,
      tickOffset: number = (config as any)[this.name].tickOffset,
      isXAxis: boolean = this.orientation() === "x",
      unitTick: string | number = isXAxis ? data[0] : last(data),
      format: any = this.tickFormatter(unitTick)

    return {
      dx: isXAxis ? 0 : tickOffset,
      dy: isXAxis ? tickOffset : (this.hasRules() ? -4 : 4),
      labelText: format,
      textAnchor: isXAxis ? "middle" : (this.name === "y1" ? "end" : "start"),
      x: isXAxis ? scale : 0,
      y: isXAxis ? 0 : scale
    }
  }

  getStartAttributes(attributes: any): any {
    let previousScale: any = this.previous.scale
    let x0: any = attributes.x === 0 ? 0 : previousScale
    let y0: any = attributes.y === 0 ? 0 : previousScale
    return defaults(attributes)({ x: x0, y: y0 })
  }

  abstract hasRules(): boolean

  abstract tickFormatter(unitTick?: any): any

  abstract tickMapper(): any

  abstract align(other: AbstractAxis): void

  abstract computeAxisInformation(computed: any, args: any): void

  computeRange(): [number, number] {
    const otherAxesDims: any = this.state.current.get("computed").axes,
      drawingContainerDims: IObject = this.state.current.get("computed").canvas.drawingContainerDims,
      x1Height: number = otherAxesDims.x1 && otherAxesDims.x1.dimensions ? otherAxesDims.x1.dimensions.height : 0,
      x2Height: number = otherAxesDims.x2 && otherAxesDims.x2.dimensions ? otherAxesDims.x2.dimensions.height : 0,
      y1Width: number = otherAxesDims.y1 && otherAxesDims.y1.dimensions ? otherAxesDims.y1.dimensions.width : 0,
      y2Width: number = otherAxesDims.y2 && otherAxesDims.y2.dimensions ? otherAxesDims.y2.dimensions.width : 0

    return this.orientation() === "x"
      ? [y1Width, drawingContainerDims.width - y2Width]
      : [drawingContainerDims.height - x1Height, x2Height + this.state.current.get("config").y1.minTopOffsetTopTick]
  }

  computeAdjustedRange(width: number): [number, number] {
    return this.orientation() === "x" ? [0, width] : [width, 0]
  }

  computeRangeDirection(range: [number, number]): string {
    return range[0] < range[1] ? "up" : "down"
  }

  computeWidth(range: [number, number]): number {
    return Math.abs(range[0] - range[1])
  }

  computeBarOffset(barSeries: IObject[], tickWidth: number): any {
    const innerPadding: number = 0,
      outerPadding: number = barSeries.length > 1 ? 0.1 : 0,
      scale = d3ScaleBand()
        .domain(map(String)(d3Range(barSeries.length)))
        .range([0, tickWidth])
        .paddingInner(innerPadding)
        .paddingOuter(outerPadding)

    forEach((series: IObject): void => {
      series.barOffset = scale(series.index)
    })(barSeries)

    return scale
  }

  adjustRange(): void {
    this.compute()
    this.draw()
  }

  close(): void {
    if (this.drawn) {
      this.el.remove()
      this.drawn = false
    }
  }
}

export default AbstractAxis
