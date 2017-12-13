import AbstractDrawingCanvas from "../utils/drawing_canvas"
import Events from "../utils/event_catalog"
import * as d3 from "d3-selection"
import { TD3Selection, IState, TStateWriter, IEvents, IObject } from "./typings"
import { find, forEach, reduce } from "lodash/fp"

const seriesElements: string[][] = [
  // ["area", "drawing_clip"],
  // ["range", "drawing_clip"],
  ["bars", "drawing_clip"],
  // ["bar_line", "drawing_clip"],
  // ["event_flag", "drawing_clip"],
  ["line", "drawing_clip"],
  // ["circles", "drawing_clip"],
  // ["trend", "drawing_clip"],
  // ["points", "xyrules_clip"],
  ["textlabels", "yrules_clip"]
]

const legendOptions: string[][] = [
  ["top", "left"],
  ["top", "right"],
  ["bottom", "left"]
]

interface IMousePosition {
  absolute: { x: number, y: number }
  relative: { x: number, y: number }
}

class Canvas extends AbstractDrawingCanvas {
  private mousePosition: IMousePosition

  constructor(state: IState, stateWriter: TStateWriter, events: IEvents, context: Element) {
    super(state, stateWriter, events, context)
    this.mousePosition = this.initialMousePosition()

    this.appendClipPaths()
    this.appendBackground()
    this.appendDrawingGroup()

    this.appendAxisElements()
    this.appendSeriesDrawingGroups(seriesElements)
    this.appendFocus()
    forEach((options: string[]): void => this.insertLegend(options[0], options[1]))(legendOptions)
    this.stateWriter("elements", this.elements)
  }

  createEl(): TD3Selection {
    return d3.select(document.createElementNS(d3.namespaces["svg"], "svg"))
  }

  appendClipPaths(): void {
    this.appendDrawingClip()
    this.appendYRulesClip()
    this.appendXYRulesClip()
  }

  appendXYRulesClip(): void {
    this.elements.defs.append("clipPath")
      .attr("class", "chart-clip-path")
      .attr("id", this.xyRulesDefinitionId())
      .append("rect")
  }

  xyRulesDefinitionId(): string {
    return this.prefixedId("_xyrules_clip")
  }

  initialMousePosition(): IMousePosition {
    return {
      absolute: {
        x: undefined,
        y: undefined
      },
      relative: {
        x: undefined,
        y: undefined
      }
    }
  }

  seriesElements(): string[][] {
    return seriesElements
  }

  appendAxisElements(): void {
    const axes: [string, string] = ["y", "x"]
    let axesMap: IObject = {}
    this.appendAxes(axes, axesMap)
    this.appendRules(axes, axesMap)
    axesMap.xRules.attr("clip-path", "url(#" + this.drawingClipDefinitionId() + ")")
    axesMap.yRules.attr("clip-path", "url(#" + this.yRulesDefinitionId() + ")")
    this.elMap.axes = axesMap
  }

  totalLegendHeight(): number {
    const computedLegends: IObject = this.state.current.get("computed").canvas.legends
    let topLegends: any[] = computedLegends.top
    let bottomLegend: any = computedLegends.bottom.left
    let topLegendsHeight: number = reduce((memo: number, legend: any): number => {
      const height: number = legend.node().offsetHeight
      return height > memo ? height : memo
    }, 0)(topLegends)
    return bottomLegend.node().offsetHeight + topLegendsHeight
  }

  trackMouseMove(): void {
    const config = this.state.current.get("config")
    this.el.on("mousemove", (): void => {
      let event: any = d3.event
      let mouse: [number, number] = d3.mouse((this.el.node() as any))
      this.mousePosition = {
        absolute: {
          x: event.pageX,
          y: event.pageY
        },
        relative: {
          x: mouse[0] - config.y1.margin || 0,
          y: mouse[1] - config.x2.margin || 0
        }
      }
      this.events.emit(Events.CHART.MOVE, this.mousePosition)
    })
  }

  stopMouseMove(): void {
    this.el.on("mousemove", undefined)
  }

  drawingDims(): { [key: string]: number } {
    const drawingContainerDims: { height: number, width: number } = this.drawingContainerDims(),
      axes: IObject = this.state.current.get("computed").axes,
      totalXAxisHeight: number = reduce.convert({ cap: false })((memo: number, axis: IObject, key: string): number => {
        if (key[0] === "x") { memo += axis.dimensions.height }
        return memo
      }, 0)(axes),
      totalYAxisWidth: number = reduce.convert({ cap: false })((memo: number, axis: IObject, key: string): number => {
        if (key[0] === "y") { memo += axis.dimensions.width }
        return memo
      }, 0)(axes),
      dims = {
        height: drawingContainerDims.height - totalXAxisHeight,
        width: drawingContainerDims.width - totalYAxisWidth,
        rulesHeight: drawingContainerDims.height - totalXAxisHeight / 2,
        rulesWidth: drawingContainerDims.width - totalYAxisWidth / 2,
        xOffset: axes.y1 ? axes.y1.dimensions.width: 0,
        yOffset: axes.x2 ? axes.x2.dimensions.height: 0
      }
    this.stateWriter("drawingDims", dims)
    return dims
  }

  setClipPathDimensions(): void {
    const drawingContainerDims: { width: number, height: number } = this.drawingContainerDims(),
      drawingDims: { [key: string]: number } = this.drawingDims()

    this.elements.defs.select(`#${this.drawingClipDefinitionId()} rect`)
      .attr("width", drawingDims.width)
      .attr("height", drawingDims.height)
      .attr("transform", `translate(${drawingDims.xOffset}, ${drawingDims.yOffset})`)

    this.elements.defs.select(`#${this.yRulesDefinitionId()} rect`)
      .attr("width", drawingDims.rulesWidth)
      .attr("height", drawingDims.height)
      .attr("transform", `translate(${drawingDims.xOffset / 2}, 0)`)

    this.elements.defs.select(`#${this.xyRulesDefinitionId()} rect`)
      .attr("width", drawingDims.rulesWidth)
      .attr("height", drawingDims.rulesHeight)
      .attr("transform", `translate(${drawingDims.xOffset / 2}, ${drawingDims.yOffset / 2})`)
  }
}

export default Canvas
