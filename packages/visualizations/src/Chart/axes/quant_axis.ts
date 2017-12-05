import AbstractAxis from "./abstract_axis"
import QuantAxisUtils from "../../utils/quant_axis_utils"
import { defaults } from "lodash/fp"

interface Scale {
  (d: number): number
}

class QuantAxis extends AbstractAxis {

  baseline: boolean = true
  dataType: string = "number"
  discrete: boolean = false
  end: number
  expand: string
  start: number

  updateOptions(options: any): void {
    this.expand = options.expand || this.expand || "zero"

    // if fixed start and / or end
    if (options.start) { this.start = options.start }
    if (options.end) { this.end = options.end }
    if (this.start && this.end && this.start === this.end) {
      this.end = this.start + 1
    }
  }

  ruleClass(ruleValue: number, index: number): string {
    return QuantAxisUtils.ruleClass(ruleValue, index, this.computed.ticks)
  }

  hasRules(): boolean {
    return true
  }

  // Computations
  // Update axis computations and ticks
  //
  // Rule: everything that goes into "computed" is passed into compute functions, never
  // access this.computed directly from within a function!
  computeAxisInformation(computed: any): void {
    let options: any = this.state.current.get("config")[this.name]
    computed.domain = QuantAxisUtils.computeDomain(this.data(), this.start, this.end, this.expand)
    computed.steps = QuantAxisUtils.computeSteps(computed.domain, computed.range, options.tickSpacing, options.minTicks)
    computed.ticks = QuantAxisUtils.computeTicks(computed.steps)
    computed.scale = QuantAxisUtils.computeScale(computed.range, computed.ticks)
    computed.baseline = this.computeBaseline(computed.domain, computed.scale)

    // Set flag whether graphical transition from earlier
    // values should be attempted
    computed.transition = true
  }

  computePreAlignment(): any {
    let options: any = this.state.current.get("config")[this.name]
    let computed: any = {}
    computed.range = this.computeRange()
    computed.rangeDirection = this.computeRangeDirection(computed.range)
    computed.domain = QuantAxisUtils.computeDomain(this.data(), this.start, this.end, this.expand)
    computed.steps = QuantAxisUtils.computeSteps(computed.domain, computed.range, options.tickSpacing, options.minTicks)
    return computed
  }

  computeAligned(computed: any): void {
    this.previous = this.computed
    computed.domain = computed.steps.slice(0, 2)
    computed.ticks = QuantAxisUtils.computeTicks(computed.steps)
    computed.scale = QuantAxisUtils.computeScale(computed.range, computed.ticks)
    computed.baseline = this.computeBaseline(computed.domain, computed.scale)
    this.computed = computed
    this.previous = defaults(this.previous, this.computed)

    // Set flag whether graphical transition from earlier
    // values should be attempted
    this.computed.transition = this.drawn
  }

  // Needed for bar and area charts
  // depends on whether domain is ascending or descending
  // and on whether it includes 0
  computeBaseline(domain: number[], scale: Scale): number {
    let i: number
    let j: number
    let low: number
    let high: number
    [i, j] = QuantAxisUtils.axisDirection(domain)
    low = domain[i]
    high = domain[j]
    return scale(low > 0 ? low : (high < 0 ? high : 0))
  }

  // Drawing
  tickFormatter(unitTick: number): string {
    return this.state.current.get("config").numberFormatter
  }

  tickMapper(): any {
    return Number
  }

  // Align Axes
  align(other: QuantAxis): void {
    let partialOne: any = this.computePreAlignment()
    let partialTwo: any = other.computePreAlignment()
    QuantAxis.alignSteps(partialOne.steps, partialTwo.steps)
    this.computeAligned(partialOne)
    other.computeAligned(partialTwo)
  }

  // Aligns Zeros if both domains have zeros otherwise aligns number of ticks
  // Expects steps to be an array of [start, stop, step]
  static alignSteps(one: any, two: any): void {
    let containsZero: (step: number[]) => [number, number] = function(step: number[]): [number, number] {
      return (step[0] <= 0 && step[1] >= 0) ? [Math.abs(step[0] / step[2]), step[1] / step[2]] : undefined
    }

    let zeroOne: number[] = containsZero(one)
    let zeroTwo: number[] = containsZero(two)

    if (zeroOne && zeroTwo) {
      let max: [number, number] = [
        Math.max(zeroOne[0], zeroTwo[0]),
        Math.max(zeroOne[1], zeroTwo[1])
      ]
      one[0] = one[0] - (max[0] - zeroOne[0]) * one[2]
      one[1] = one[1] + (max[1] - zeroOne[1]) * one[2]
      two[0] = two[0] - (max[0] - zeroTwo[0]) * two[2]
      two[1] = two[1] + (max[1] - zeroTwo[1]) * two[2]
    } else {
      let stepsL: number = (one[1] - one[0]) / one[2]
      let stepsR: number = (two[1] - two[0]) / two[2]
      let stepsDiff: number = stepsL - stepsR
      if (stepsDiff > 0) {
        two[0] = two[0] - Math.floor(stepsDiff / 2) * two[2]
        two[1] = two[1] + Math.ceil(stepsDiff / 2) * two[2]
      } else if (stepsDiff < 0) {
        one[0] = one[0] + Math.ceil(stepsDiff / 2) * one[2]
        one[1] = one[1] - Math.floor(stepsDiff / 2) * one[2]
      }
    }
  }
}

export default QuantAxis
