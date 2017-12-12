import AbstractAxis from "./abstract_axis"
import { forEach, sortBy, uniq } from "lodash/fp"
import { scaleBand as d3ScaleBand } from "d3-scale"
import { IConfig, IObject } from "../typings"

class OrdinalAxis extends AbstractAxis {

  baseline: boolean = false
  dataType: string = "string"
  discrete: boolean = true
  values: string[]

  updateOptions(options: any): void {
    this.values = options.values || this.values
  }

  guess(data: string[]): string[] {
    // @TODO: implement sorting of mixed strings
    // return Sort.sortMixedStrings()(uniq(data))
    return sortBy((d: string) => d)(uniq(data))
  }

  hasRules(): boolean {
    return false
  }

  // Computations
  // Update axis computations and ticks
  //
  // Rule: everything that goes into "computed" is passed into compute functions, never
  // access this.computed directly from within a function!
  computeAxisInformation(computed: any): void {
    computed.domain = this.computeDomain()
    computed.tickNumber = this.computeTickNumber(computed.domain)
    computed.ticksInDomain = computed.tickNumber // for ordinal axis, this is the same
    computed.tickWidth = computed.width / computed.ticksInDomain

    // tickWidth too small, adjust...
    // This will result in bars possibly overflowing the svg drawing area
    // - but looks still better than drawing all bars on top of each other
    const config: IConfig = this.state.current.get("config")
    let minTickWidth: number = Math.max(
      config.minBarTickWidth.ordinal,
      config.minBarWidth * computed.numberOfBars
    )
    if (computed.tickWidth < minTickWidth) {
      computed.tickWidth = minTickWidth
      computed.width = computed.ticksInDomain * computed.tickWidth
      computed.range = this.computeAdjustedRange(computed.width)
    }

    // Used in many computations
    computed.halfTickWidth = computed.tickWidth / 2

    // Ordinal scale will return the beginning of each range band,
    // to move that to the middle (as needed for non-bar renderers)
    // we shift the range we use to create the scale by half a tick
    let shiftedRange: [number, number] = [
      computed.range[0] + computed.halfTickWidth,
      computed.range[1] + computed.halfTickWidth
    ]

    const numberOfBars = this.state.current.get("computed").series.computed[this.name].numberOfBars
    if (numberOfBars > 0) {
      computed.barSeries = this.computeBarSeries(computed)    }

    computed.scale = this.computeScale(shiftedRange, computed.domain)
    computed.ticks = computed.domain
  }

  computeBarSeries(computed: IObject): void {
    let barSeries = this.state.current.get("computed").series.computed[this.name].barSeries
    computed.barOffsetScale = this.computeBarOffset(barSeries, computed.tickWidth)
    this.computeBarDimension(computed, barSeries)
    return barSeries
  }

  computeAligned(computed: any): void {}

  computeDomain(): string[] {
    return this.values || this.guess(this.data())
  }

  computeTickNumber(domain: string[]): number {
    return domain.length
  }

  computeScale(range: [number, number], domain: string[]): (val: string) => number {
    return d3ScaleBand().domain(domain).range(range)
  }

  computeBarDimension(computed: IObject, barSeries: IObject[]): void {
    forEach((series: IObject): void => {
      series.barDimension = computed.barOffsetScale.bandwidth()
    })(barSeries)
  }

  // Drawing
  tickFormatter(): any {
    return String
  }

  tickMapper(): any {
    return String
  }

  // Align Axes
  align(other: OrdinalAxis): void {
    this.compute()
    other.computeAligned(this.computed)
  }

}

export default OrdinalAxis
