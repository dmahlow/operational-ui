import AbstractDrawingCanvas from "../utils/drawing_canvas"
import Events from "../utils/event_catalog"
import * as d3 from "d3-selection"
import { TD3Selection, IState, TStateWriter, IEvents, IObject } from "./typings"
import { find, forEach, reduce } from "lodash/fp"

const seriesElements: string[][] = [
  // ["area", "drawing_clip"],
  // ["range", "drawing_clip"],
  // ["bars", "drawing_clip"],
  // ["bar_line", "drawing_clip"],
  // ["event_flag", "drawing_clip"],
  ["line", "drawing_clip"],
  // ["circles", "drawing_clip"],
  // ["trend", "drawing_clip"],
  // ["points", "drawing_clip"],
  // ["textlabels", "yrules_clip"]
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

    this.appendDrawingClip()
    this.appendYRulesClip()
    this.appendBackground()
    this.appendDrawingGroup()

    let axes: [string, string] = ["y", "x"]
    this.appendAxes(axes)
    this.appendRules(axes)
    this.elements.xRules.attr("clip-path", "url(#" + this.drawingClipDefinitionId() + ")")
    this.elements.yRules.attr("clip-path", "url(#" + this.yRulesDefinitionId() + ")")
    this.appendSeriesDrawingGroups(seriesElements)
    this.appendFocus()
    forEach((options: string[]): void => this.insertLegend(options[0], options[1]))(legendOptions)
    this.stateWriter("elements", this.elements)
  }

  createEl(): TD3Selection {
    return d3.select(document.createElementNS(d3.namespaces["svg"], "svg"))
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
}

export default Canvas
