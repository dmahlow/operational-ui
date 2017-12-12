import Series from "./series/series"
import { concat, filter, flatten, flow, forEach, invoke, isArray, keys, map, reduce, result, some, sortBy, uniqueId, uniq } from "lodash/fp"
import { IEvents, ISeries, IState, IObject, TStateWriter, TD3Selection } from "./typings"

class SeriesManager {
  el: TD3Selection
  oldSeries: any = []
  required: string[]
  series: any = {}
  state: IState
  stateWriter: TStateWriter
  events: IEvents
  accessors: any

  constructor(state: IState, stateWriter: TStateWriter, events: IEvents, el: TD3Selection) {
    this.state = state
    this.stateWriter = stateWriter
    this.events = events
    this.el = el
  }

  prepareData(): void {
    let dataSeries: any = this.state.current.get("accessors").data.series(this.state.current.get("data"))
    if (!dataSeries) {
      this.removeAll()
    }

    forEach((series: any) => series.key = series.key || uniqueId("series"))(dataSeries)
    const seriesKeys: string[] = map((series: any): string => series.key)(dataSeries)
    let computed: IObject = {}

    this.removeAllExcept(seriesKeys)

    forEach(this.prepareSeries.bind(this))(dataSeries)
    forEach(this.updateComputed(computed).bind(this))(this.series)

    this.stateWriter("requiredAxes", this.requiredAxes())
    this.stateWriter("hasData", this.hasData())
    this.stateWriter("computed", computed)
    this.stateWriter("dataForLegend", this.dataForLegend())

    this.addMissingDatapoints()
  }

  hasData(): boolean {
    return some(result("hasData"))(this.series)
  }

  prepareSeries(attributes: any): void {
    this.updateOrCreate(attributes)
    if (attributes.data) {
      this.get(attributes.key).setData(attributes.data, attributes.total)
    }
  }

  updateOrCreate(attributes: any): void {
    let series: any = this.get(attributes.key)
    series != null ? series.update(attributes) : this.create(attributes)
  }

  create(attributes: any): void {
    this.series[attributes.key] = new Series(this.state, attributes, this.state.current.get("accessors").series)
  }

  // Some renderers have width and are centred on ticks, so ticks need to be offset.
  tickOffsetRequired(series: Series, axis: string): boolean {
    return series.dataFormat()[series.dataIndeces()[axis[0]]] !== "number" &&
      series.renderAs().indexOf("bars") > -1 ||
      series.renderAs().indexOf("bar_line") > -1
  }

  hasBars(series: Series, axis: string): boolean {
    return series.dataFormat()[series.dataIndeces()[axis[0]]] !== "number" &&
      series.renderAs().indexOf("bars") > -1
  }

  updateComputed(computed: IObject) {
    return (series: Series): void => {
      const axes: any = this.state.current.get("accessors").data.axes(this.state.current.get("data"))
      reduce((memo: IObject, axis: string): IObject => {
        // Check compatible
        series.checkCompatible(axis, axes[axis].type)

        memo[axis] = memo[axis] || {
          data: [],
          series: [],
          hasFlags: false,
          // tickOffsetRequired: this.tickOffsetRequired(series, axis),
          numberOfBars: 0,
          barSeries: []
        }

        memo[axis].data = flow(
          concat(memo[axis].data),
          uniq(),
          sortBy((x: any) => x),
        )(series.dataForAxis(axis))

        memo[axis].series.push(series.key())

        memo[axis].numberOfBars += this.tickOffsetRequired(series, axis) ? 1 : 0

        if (this.hasBars(series, axis)) {
          const i: number = memo[axis].barSeries.length
          memo[axis].barSeries.push({ key: series.key(), index: i })
        }

        return memo
      }, computed)([series.xAxis(), series.yAxis()])
    }
  }

  addMissingDatapoints(): void {
    forEach((axis: string): void => {
      const series: Series[] = this.seriesForAxes()[axis]
      if (series.length > 1 && ["ordinal", "time"].indexOf(this.state.current.get("data").axes[axis].type) > -1) {
        const requiredValues: any[] = flow(
          map((d: Series): any[] => d.dataForAxis(axis)),
          flatten,
          uniq,
          sortBy((x: any) => x)
        )(series)
        forEach((d: Series): void => {
          d.addMissingDatapoints(axis, requiredValues)
        })(series)
      }
    })(this.required)
  }

  get(sid: string): any {
    return this.series[sid]
  }

  remove(sid: string): void {
    let series: any = this.series[sid]
    if (!series) { return }
    this.oldSeries.push(series)
    delete this.series[sid]
  }

  removeAll(): void {
    flow(
      keys,
      forEach(this.remove)
    )(this.series)
  }

  removeAllExcept(sids: string[]): void {
    flow(
      keys,
      filter((sid: string): boolean => sids.indexOf(sid) === -1),
      forEach(this.remove)
    )(this.series)
  }

  draw(): void {
    // Clean up any old stuff
    invoke("close")(this.oldSeries)
    this.oldSeries = []

    // Draw the new stuff
    forEach((series: Series): void => {
      series.computeAxisMappings()
      series.draw()
    })(this.series)
  }

  getLegendData(axis?: string): IObject[] {
    let series: ISeries[]
    if (axis) {
      series = filter((d: ISeries): boolean => {
        return d.yAxis() === axis || d.xAxis() === axis && !d.hideInLegend()
      })(this.series)
    }
    return map((d: ISeries): IObject => d.legendData())(series || this.series)
  }

  dataForLegend(): IObject {
    let data: IObject = {
      top: { left: [], right: [] },
      bottom: { left: [] }
    }

    const xAxes: string[] = uniq(map((series: Series) => series.xAxis())(this.series)),
      yAxes: string[] = uniq(map((series: Series) => series.yAxis())(this.series))

    if (yAxes.length > 1) {
      data.top.left = this.getLegendData("y1")
      data.top.right = this.getLegendData("y2")
    } else if (xAxes.length > 1) {
      data.top.left = this.getLegendData("x2")
      data.bottom.left = this.getLegendData("x1")
    } else {
      data.top.left = this.getLegendData()
    }
    return data
  }

  requiredAxes(): string[] {
    this.required = uniq(
      reduce((memo: string[], series: Series): string[] => {
        memo.push(series.xAxis(), series.yAxis())
        return memo
      }, [])(this.series)
    )
    return this.required
  }

  seriesForAxes(): IObject {
    const seriesForAxes: IObject = {}
    forEach((axis: string): void => {
      const axisSeries: Series[] = filter((series: Series): boolean => {
        return series.xAxis() === axis || series.yAxis() === axis
      })(this.series)
      seriesForAxes[axis] = axisSeries
    })(this.state.current.get("computed").series.requiredAxes)
    this.stateWriter("seriesForAxes", seriesForAxes)
    return seriesForAxes
  }
}

export default SeriesManager
