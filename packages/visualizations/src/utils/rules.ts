import { IState, TD3Selection } from "./typings"
import { easeLinear } from "d3-ease"
import * as styles from "./styles"

abstract class Rules {

  drawn: boolean
  el: TD3Selection
  name: string
  state: IState

  constructor(state: IState, name: string, el: TD3Selection) {
    this.state = state
    this.name = name
    this.el = el
  }

  draw(axis: any): void {
    this.drawn ? this.updateDraw(axis) : this.initialDraw(axis)
  }

  initialDraw(axis: any): void {
    // Root svg element
    // this.el = d3.select(document.createElementNS(d3.ns.prefix["svg"], "g"))
    //   .attr("class", "axis-rules")

    // this.state.canvas.insertElement(this.name + "Rules", this.el)

    this.updateDraw(axis)

    this.drawn = true
  }

  updateDraw(axis: any): void {
    let duration: number = this.state.current.get("config").duration
    let scale: (d: any) => number = axis.computed.scale
    let previousScale: (d: any) => number = axis.previous.scale
    let map: any = axis.tickMapper()
    let data: any[] = axis.computed.ticks

    let coordinates: any = this.setCoordinates(previousScale, scale, axis)

    // Rule selection
    let ticks: any = this.el.selectAll(`line.${styles.rule}`)
      .data(data, map)

    ticks.exit().transition()
      .duration(duration)
      .ease(easeLinear)
      .attr("x1", coordinates.x11)
      .attr("x2", coordinates.x21)
      .attr("y1", coordinates.y11)
      .attr("y2", coordinates.y21)
      .remove()

    ticks.enter().append("svg:line")
      .attr("x1", coordinates.x10)
      .attr("x2", coordinates.x20)
      .attr("y1", coordinates.y10)
      .attr("y2", coordinates.y20)
      .merge(ticks)
      .attr("class", (d: any, i: number): string => `${styles.rule} ${axis.ruleClass(d, i)}`)
      .transition()
      .duration(duration)
      .ease(easeLinear)
      .attr("x1", coordinates.x11)
      .attr("x2", coordinates.x21)
      .attr("y1", coordinates.y11)
      .attr("y2", coordinates.y21)
  }

  abstract setCoordinates(previousScale: (d: any) => number, scale: (d: any) => number, axis: any): any

  resize(axis: any): void {
    this.updateDraw(axis)
  }

  close(): void {
    if (this.drawn) {
      this.el.remove()
      this.drawn = false
    }
  }

}

export default Rules
