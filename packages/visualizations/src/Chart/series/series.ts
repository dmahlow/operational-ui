import Renderer from "./renderer/renderer"
import { TD3Selection, IObject, IState } from "../typings"
import { every, extend, filter, forEach, get, invoke, isArray, isDate, isObject, map, reduce } from "lodash/fp"

const axisTypeMapper: IObject = {
  time: "date",
  realtime: "date",
  quant: "number",
  ordinal: "string"
}

const validators: IObject = {
  date: isDate,
  number: isFinite,
  object: isObject,
  string: () => true
}

// Simple function to compute a hash from a string
// Use this for caching (checking whether something changed) etc.
function hashString(string: string): number {
  return reduce((memo: number, char: string): number => {
    memo = ((memo << 5) - memo) + char.charCodeAt(0)
    return memo & memo
  }, 0)(string.split(""))
}
// hash a JSON stringified object
function hashObject(obj: IObject): number {
  return hashString(JSON.stringify(obj))
}

class Series {
  accessors: any
  attributes: any
  axisUnit: string
  color: () => string
  data: () => any[]
  dataFormat: () => string[]
  dataIndeces: any
  dataPoints: any = []
  drawn: boolean = false
  el: any
  formatter: () => any
  hideInLegend: () => boolean
  key: () => string
  legendName: string
  mappings: any
  name: () => string
  renderAs: () => any
  renderers: Renderer[]
  renderersHash: number
  stacked: boolean
  state: IState
  total: number
  unit: () => string
  xAxis: () => string
  yAxis: () => string

  constructor(state: IState, attributes: any, accessors: any) {
    this.state = state
    this.attributes = extend.convert({ immutable: false })({}, attributes)
    this.accessors = accessors
    this.assignAccessors()
    this.renderers = this.initializeRenderers()
  }

  assignAccessors(): void {
    forEach.convert({ cap: false })((accessor: any, key: string) => {
      (this as any)[key] = () => accessor(this.attributes)
    })(this.accessors)
  }

  initializeRenderers(): Renderer[] {
    const renderers: string[] = this.renderAs()
    return reduce((memo: Renderer[], renderer: string): Renderer[] => {
      const el: TD3Selection = this.state.current.get("computed").canvas.elements.series[renderer]
      memo.push(new Renderer(this.state, this, renderer, el, {}))
      return memo
    }, [])(renderers)
  }

  // Remove rows with invalid data
  setData(data: any[], total: number): void {
    function selectValidators(dataFormat: any): any {
      return map((format: any): any => {
        if (isArray(format)) {
          return (subValues: any[]): any => {
            return forEach((subValue: any, i: number): any => {
              return selectValidators(format)[i](subValue)
            })(subValues)
          }
        } else {
          return validators[format]
        }
      })(dataFormat)
    }

    let validate: ((value: any) => boolean)[] = selectValidators(this.dataFormat())
    this.dataPoints = filter((dataPoint: any): boolean => {
      return every.convert({ cap: false })((value: any, i: number): boolean => {
        return i > validate.length - 1 || validate[i](value)
      })(dataPoint)
    })(data)

    this.total = total
  }

  hasData(): boolean {
    return this.data() != null && this.data().length > 0
  }

  addMissingDatapoints(axis: string, requiredValues: any[]): void {
    const currentValues: any[] = this.dataForAxis(axis),
      currentData: any[] = this.dataPoints,
      index: number = this.dataIndeces()[axis[0]]

    if (currentValues.length === requiredValues.length) { return }

    this.dataPoints = map((val: any): any[] => {
      let datum: any[] = []
      datum[index] = val
      const current: any[] = currentData.find((datum: any[]): boolean => datum[index] === val)
      datum[1 - index] = current ? current[1 - index] : undefined
      return datum
    })(requiredValues)
  }

  seriesAxisType(axis: string): string {
    return this.dataFormat()[this.dataIndeces()[axis[0]]]
  }

  checkCompatible(axisName: string, dataType: string): boolean {
    const seriesAxisType: string = this.seriesAxisType(axisName)
    if (seriesAxisType === axisTypeMapper[dataType]) { return true }
    throw new Error("Data type " + seriesAxisType + " of series is not compatible with " + axisName + "-axis which requires " + dataType)
  }

  // Update with running index if data is stacked
  dataForAxis(axisName: string): any[] {
    return map((datum: any[]): any => datum[this.dataIndeces()[axisName[0]]])(this.dataPoints)
  }

  axisMapping(axisName: string): any {
    let mapping: any = (this as any)[axisName.match(/x|y/)[0]]
    if (!mapping) { return }
    return mapping.axisName === axisName ? mapping : null
  }

  // focusPoint(axisName: string, focus: any): any {
  //   if (!this.hasData() || this.hasRenderer("event_flag")) { return }

  //   // Look up focus axis information
  //   let focusMapping: any = this.mappings[axisName]

  //   // Find the datapoint for the focused tick
  //   let search: (dp: any) => boolean = function(dataPoint: any): boolean {
  //     return isDate(focus)
  //       ? dataPoint[focusMapping.index].valueOf() === focus.valueOf()
  //       : dataPoint[focusMapping.index] === focus
  //   }

  //   let match: any[] = find(search)(this.dataPoints)
  //   if (!match) { return }

  //   // Get the value for the focused data point for the other axis
  //   let valueMapping: any = this.mappings[this.otherAxis(focusMapping.axis.orientation())]
  //   // Make sure we have an array (makes it compatible with ranges which return a tuple)
  //   let values: any[] = [].concat(match[valueMapping.index])
  //   if (!values.length) { return }

  //   let positionValues: number[] = this.stacked ? [].concat(match[valueMapping.runningIndex]) : values
  //   let positions: any[] = map(valueMapping.axis.computed.scale)(positionValues)

  //   return {
  //     barsOnly: this.hasOnlyRenderer("bars"),
  //     color: this.color,
  //     colorHex: this.colorHex,
  //     formatter: this.displayFormatter(),
  //     name: this.name,
  //     stacked: this.stacked,
  //     total: this.total,
  //     unit: this.unit,
  //     valuePositions: positions,
  //     values: values
  //   }
  // }

  draw(): void {
    this.drawn ? this.updateDraw() : this.initialDraw()
  }

  initialDraw(): void {
    this.updateDraw()
    this.drawn = true
  }

  updateDraw(): void {
    this.hasData() ? forEach(invoke("draw"))(this.renderers) : forEach(invoke("close"))(this.renderers)
  }

  resize(): void {
    if (this.hasData()) {
      invoke("resize")(this.renderAs())
    }
  }

  // Inserts an SVG element into the series group (used by renderers)
  insertElement(name: string, element: any): void {
    this.el[name].node().appendChild(element.node())
  }

  close(): void {
    if (this.drawn) {
      invoke("close")(this.renderAs())
      invoke("remove")(this.el)
      this.drawn = false
    }
  }

}

export default Series
