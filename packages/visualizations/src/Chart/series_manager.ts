import Series from "./series/series"
import { concat, filter, flatten, flow, forEach, invoke, isArray, keys, map, reduce, result, some, sortBy, uniqueId, uniq } from "lodash/fp"
import { IEvents, IState, IObject, TStateWriter, TD3Selection } from "./typings"

class SeriesManager {
  el: TD3Selection
  oldSeries: any = []
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
    this.addMissingDatapoints()

    this.stateWriter("series", this.series)
    this.stateWriter("oldSeries", this.oldSeries)
    this.stateWriter("hasData", this.hasData())
    this.stateWriter("computed", computed)
    this.exportData()
  }

  hasData(): boolean {
    return some(result("hasData"))(this.series)
  }

  // @TODO Move to individual series?
  exportData(): void {
    this.multipleAxes()
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
          tickOffsetRequired: false
        }

        memo[axis].data = flow(
          concat(memo[axis].data),
          uniq(),
          sortBy((x: any) => x),
        )(series.dataForAxis(axis))

        memo[axis].series.push(series.key())
        return memo
      }, computed)([series.xAxis(), series.yAxis()])
    }
  }

  addMissingDatapoints(): void {
    const requiredAxes: string[] = this.requiredAxes()
    forEach((axis: string): void => {
      const series: Series[] = this.seriesForAxes()[axis]
      if (series.length > 1 && ["ordinal", "time"].indexOf(this.state.current.get("data").axes[axis].type) > -1) {
        const requiredValues: any[] = flow(
          map((s: Series): any[] => s.dataForAxis(axis)),
          flatten,
          uniq,
          sortBy((x: any) => x)
        )(series)
        forEach((s: Series): void => {
          s.addMissingDatapoints(axis, requiredValues)
        })(series)
      }
    })(requiredAxes)
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
    forEach(invoke("draw"))(this.series)
  }

  multipleAxes(): void {
    const xAxes: string[] = uniq(map((series: Series) => series.xAxis())(this.series)),
      yAxes: string[] = uniq(map((series: Series) => series.yAxis())(this.series))
      if (yAxes.length > 1) {
        this.stateWriter("multipleAxes", "y")
      }
      if (xAxes.length > 1) {
        this.stateWriter("multipleAxes", "x")
      }
  }

  requiredAxes(): string[] {
    const required: string[] = uniq(
      reduce((memo: string[], series: Series): string[] => {
        memo.push(series.xAxis())
        memo.push(series.yAxis())
        return memo
      }, [])(this.series)
    )
    this.stateWriter("requiredAxes", required)
    return required
  }

  seriesForAxes(): IObject {
    const axes: IObject = {}
    forEach((axis: string): void => {
      const axisSeries: Series[] = filter((series: Series): boolean => {
        return series.xAxis() === axis || series.yAxis() === axis
      })(this.series)
      axes[axis] = axisSeries
    })(this.state.current.get("computed").series.requiredAxes)
    this.stateWriter("seriesForAxes", axes)
    return axes
  }
}

export default SeriesManager
