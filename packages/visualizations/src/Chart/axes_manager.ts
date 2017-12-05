import AbstractAxis from "./axes/abstract_axis"
import Axis from "./axes/axis"
import Rules from "./axes/rules"
import { IObject, IState, TStateWriter, IEvents, TD3Selection } from "./typings"
import { compact, filter, find, findIndex, flow, forEach, invoke, reduce, sortBy } from "lodash/fp"

const validAxes: string[] = ["x1", "x2", "y1", "y2"]

class AxesManager {

  axes: Axis[] = []
  oldAxes: Axis[] = []
  rules: any = {}
  state: any
  stateWriter: TStateWriter
  events: IEvents

  constructor(state: IState, stateWriter: TStateWriter, events: IEvents) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
  }

  checkValidity(name: string): void {
    if (validAxes.indexOf(name) === -1) {
      throw new Error("invalid axis name '" + name + "' - valid names " + validAxes.join(" or "))
    }
  }

  compute(): void {
    this.oldAxes = this.axes
    this.axes = []

    const axesData = this.state.current.get("accessors").data.axes(this.state.current.get("data")),
      elements: IObject = this.state.current.get("computed").canvas.elements

    forEach.convert({ cap: false })((axisData: IObject, key: string): void => {
      this.checkValidity(key)
      const existingAxisIndex: number = findIndex({ name: key, type: axisData.type })(this.oldAxes)
      this.axes.push(existingAxisIndex > -1 ? this.oldAxes[existingAxisIndex] : new Axis(this.state, key, axisData, elements[key[0] + "Axes"]))
      if (existingAxisIndex > -1) {
        this.oldAxes.splice(existingAxisIndex, 1)
      }
    })(axesData)

    forEach(invoke("close"))(this.oldAxes)

    this.eachXY((axes: AbstractAxis[]): void => {
      // only if both axes are used by series do they need to be aligned
      const requiredAxes: string[] = this.state.current.get("computed").series.requiredAxes,
        computeAxes: any = filter((axis: AbstractAxis): boolean => {
          return requiredAxes.indexOf(axis.name) > -1
        })(axes)

      if (computeAxes.length === 2) {
        this.align(computeAxes)
      } else {
        forEach(invoke("compute"))(axes)
      }
    })
  }

  draw(): void {
    this.compute()
    this.eachXY((axes: AbstractAxis[]): void => {
      // only if both axes are used by series do they need to be aligned
      const requiredAxes: string[] = this.state.current.get("computed").series.requiredAxes,
        computeAxes: any = filter((axis: AbstractAxis): boolean => {
          return requiredAxes.indexOf(axis.name) > -1
        })(axes)
      if (computeAxes.length === 2) {
        this.align(computeAxes)
      } else {
        forEach((axis: AbstractAxis): void => {
          axis.compute()
        })(axes)
      }
      forEach((axis: AbstractAxis): void => {
        axis.draw()
        this.stateWriter([axis.name], { dimensions: axis.axisDimensions() })
      })(axes)
    })
    this.adjustMargins()
    this.drawRules()
  }

  // The x-axes need to be moved to ensure the y-axes have enough space
  adjustMargins(): void {
    forEach(invoke("adjustRange"))(this.axesForOrientation("x"))
  }

  drawRules(): void {
    this.eachXY((axes: AbstractAxis[], orientation: string): void => {
      // Draw / Update rules
      const axisWithRules: AbstractAxis = find((axis: AbstractAxis): boolean => axis.hasRules())(axes)
      if (axisWithRules) {
        let rules: Rules = this.rules[orientation]
        if (!rules) {
          const element: TD3Selection = this.state.current.get("computed").canvas.elements[orientation + "Rules"]
          rules = this.rules[orientation] = new Rules(this.state, orientation, element)
        }
        rules.draw(axisWithRules)
      } else {
        // Remove Rules
        if (this.rules[orientation]) { this.rules[orientation].close() }
        delete this.rules[orientation]
      }
    })
  }

  eachXY(func: any): void {
    forEach((orientation: string): void => {
      func.call(this, this.axesForOrientation(orientation), orientation)
    })(["x", "y"])
  }

  axesForOrientation(orientation: string): AbstractAxis[] {
    return filter((axis: AbstractAxis): boolean => {
      return axis.orientation() === orientation
    })(this.axes)
  }

  align(axes: [AbstractAxis, AbstractAxis]): void {
    axes[0].align(axes[1])
  }
}

export default AxesManager
