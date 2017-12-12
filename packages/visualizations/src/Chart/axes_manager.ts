import AbstractAxis from "./axes/abstract_axis"
import Axis from "./axes/axis"
import Rules from "./axes/rules"
import { IObject, IState, TStateWriter, IEvents, TD3Selection } from "./typings"
import { compact, filter, find, findIndex, flow, forEach, invoke, keys, reduce, sortBy } from "lodash/fp"

const validAxes: string[] = ["x1", "x2", "y1", "y2"]

class AxesManager {

  axes: Axis[] = []
  elements: { [key: string]: TD3Selection }
  oldAxes: Axis[] = []
  rules: any = {}
  state: any
  stateWriter: TStateWriter
  events: IEvents

  constructor(state: IState, stateWriter: TStateWriter, events: IEvents, elements: { [key: string]: TD3Selection }) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.elements = elements
  }

  checkValidity(name: string): void {
    if (validAxes.indexOf(name) === -1) {
      throw new Error("invalid axis name '" + name + "' - valid names " + validAxes.join(" or "))
    }
  }

  subStateWriter(axis: string): any {
    this.stateWriter([axis], {})
    return (path: string[], value: any): void => {
      this.stateWriter([axis].concat(path), value)
    }
  }

  compute(): void {
    this.oldAxes = this.axes
    this.axes = []

    const axesOptions = this.state.current.get("accessors").data.axes(this.state.current.get("data"))

    forEach.convert({ cap: false })((axisOptions: IObject, key: string): void => {
      this.checkValidity(key)
      if (!this.isRequiredAxis(key)) { return }
      const existingAxisIndex: number = findIndex({ name: key, type: axisOptions.type })(this.oldAxes)
      this.axes.push(
        existingAxisIndex > -1
          ? this.oldAxes[existingAxisIndex]
          : new Axis(this.state, this.subStateWriter(key), key, axisOptions, this.elements[key[0] + "Axes"])
      )
      if (existingAxisIndex > -1) {
        this.oldAxes.splice(existingAxisIndex, 1)
      }
    })(axesOptions)

    forEach(invoke("close"))(this.oldAxes)

    this.eachXY((axes: AbstractAxis[]): void => {
      // only if both axes are used by series do they need to be aligned
      const computeAxes: any = filter((axis: AbstractAxis): boolean => {
        return this.isRequiredAxis(axis.name)
      })(axes)

      if (computeAxes.length === 2) {
        this.align(computeAxes)
      } else {
        forEach(invoke("compute"))(axes)
      }
    })
  }

  isRequiredAxis(axisName: string): boolean {
    const requiredAxes: string[] = keys(this.state.current.get("computed").series.axes)
    return requiredAxes.indexOf(axisName) > -1
  }

  draw(): void {
    this.compute()
    this.eachXY((axes: AbstractAxis[]): void => {
      // only if both axes are used by series do they need to be aligned
      const computeAxes: any = filter((axis: AbstractAxis): boolean => {
        return this.isRequiredAxis(axis.name)
      })(axes)
      if (computeAxes.length === 2) {
        this.align(computeAxes)
      } else {
        forEach((axis: AbstractAxis): void => {
          axis.compute()
        })(computeAxes)
      }
      forEach((axis: AbstractAxis): void => {
        axis.draw()
      })(computeAxes)
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
          const element: TD3Selection = this.elements[orientation + "Rules"]
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
