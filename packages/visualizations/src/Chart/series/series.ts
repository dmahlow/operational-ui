// import Renderer from "./renderer/renderer"
import { IObject } from "../typings"
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
  // data: (d: any) => any
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
  renderersHash: number
  stacked: boolean
  state: any
  total: number
  unit: () => string
  xAxis: () => string
  yAxis: () => string

  constructor(attributes: any, accessors: any) {
    this.attributes = extend.convert({ immutable: false })({}, attributes)
    this.accessors = accessors
    this.assignAccessors()
  }

  assignAccessors(): void {
    forEach.convert({ cap: false })((accessor: any, key: string) => {
      (this as any)[key] = () => accessor(this.attributes)
    })(this.accessors)
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
    // el for series is actually a POJO of svg:g elements for all the different renderers
    this.el = this.state.canvas.insertSeries()
    this.updateDraw()
    this.drawn = true
  }

  updateDraw(): void {
    forEach((el: any): void => {
      el.attr("class", "series")
        .attr("data-sid", this.key())
    })(this.el)

    this.hasData() ? invoke("draw")(this.renderAs()) : invoke("close")(this.renderAs())
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
