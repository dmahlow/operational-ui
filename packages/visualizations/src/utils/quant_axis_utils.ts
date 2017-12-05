import { filter, find, last, isUndefined, sortBy } from "lodash/fp"
import { scaleLinear as d3ScaleLinear } from "d3-scale"
import { range as d3Range, extent as d3Extent } from "d3-array"

function stepScaleFactors(step: number): number[] {
  return step === 1
    ? [10, 5, 2, 1]
    : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
}

// Axis Formatting
const QuantAxisUtils: any = {
  // Public Functions
  // These functions are not included directly in the base quant axis class
  // because they are also required by the chart quant axis class, which does
  // not extend the base quant axis class. Step and tick calculation is also
  // used elsewhere, e.g. in the cohort chart row focus.

  // Expand extent
  axisDirection: function(extent: [number, number]): [number, number] {
    return extent[1] > extent[0] ? [0, 1] : [1, 0]
  },

  computeDomain: function(data: number[], start: number, end: number, expand: string): [number, number] {
    let extent: [number, number] = this.guess(data, expand)
    return [start || extent[0], end || extent[1]]
  },

  computeScale: function(range: [number, number], ticks: any[]): (val: number) => number {
    return d3ScaleLinear().range(range).domain(d3Extent(ticks))
  },

  // Computes nice steps (for ticks) given a domain [start, stop] and a
  // wanted number of ticks (number of ticks returned might differ
  // by a few ticks)
  computeSteps: function(domain: [number, number], range: [number, number], spacing: number, minTicks: number): number[] {
    const tickNumber: number = this.computeTickNumber(range, spacing, minTicks),
      span: number = domain[1] - domain[0]

    let step: number = Math.pow(10, Math.floor(Math.log(Math.abs(span) / tickNumber) / Math.LN10)),
     scaleFactor: number

    if (span < 0) { step = step * -1 }

    if (this.end) {
      // If a value has been explicitly set for this.end, there must be a tick at this value
      const validScaleFactors = filter((val: number): boolean => span / (step * val) % 1 === 0)(stepScaleFactors(step))
      // Choose scale factor which gives a number of ticks as close as possible to tickNumber
      scaleFactor = sortBy((val: number): number => Math.abs(span / (val * step) - tickNumber))(validScaleFactors)[0]
    } else {
      const err: number = tickNumber / span * step
      if (err <= .15) {
        scaleFactor = 10
      } else if (err <= .35) {
        scaleFactor = 5
      } else if (err <= .75) {
        scaleFactor = 2
      } else {
        scaleFactor = 1
      }
    }
    step *= scaleFactor

    return [
      Math.floor(domain[0] / step) * step, // start
      Math.ceil(domain[1] / step) * step, // stop
      step // step
    ]
  },

  computeTickNumber: function(range: [number, number], tickSpacing: number, minTicks: number = 0): number {
    let length: number = Math.abs(range[0]) + Math.abs(range[1])
    return Math.max(
      Math.floor(length / tickSpacing),
      minTicks
    )
  },

  computeTicks: function(steps: [number, number, number]): number[] {
    let ticks: number[] = d3Range(steps[0], steps[1], steps[2])
    ticks.push(steps[1])
    if (last(ticks) < 0) { ticks.push(0) }
    return ticks
  },

  // Increase the extent by 5% on both sides (so that there's some space
  // between the drawings and the borders of the chart), unless one of the ends
  // equals 0
  extentCushion: function(extent: [number, number]): [number, number] {
    let [i, j]: [number, number] = this.axisDirection(extent)
    let distance: number = extent[j] - extent[i]

    if (extent[i] !== 0) { extent[i] = extent[i] - (0.05 * distance) }
    if (extent[j] !== 0) { extent[j] = extent[j] + (0.05 * distance) }

    return extent
  },

  // Decides whether to cut axis to values based on how big the gap between start / end is
  extentSmart: function(extent: [number, number]): [number, number] {
    let [i, j]: [number, number] = this.axisDirection(extent)
    let distance: number = extent[j] - extent[i]

    let ratio: number = extent[i] > 0 ? distance / extent[i] : distance / Math.abs(extent[j])

    // No ratio if zero is already included
    return (!ratio || ratio < 0.2) ? extent : this.extentZero(extent)
  },

  // Expands an extent [start, end] to include zero as start or end
  // if it does not already contain zero
  extentZero: function(extent: [number, number]): [number, number] {
    let [i, j]: [number, number] = this.axisDirection(extent)

    if (extent[i] > 0) {
      extent[i] = 0
    } else if (extent[j] < 0) {
      extent[j] = 0
    }

    return extent
  },

  // Guess start, end from data
  guess: function(data: number[] = [], expand: string): number[] {
    let extent: number[] = d3Extent(data)

    // If this axis is user configured but does not currently have any data,
    // we still need to guess some extent here - otherwise animations will blow up
    if (isUndefined(extent[0])) {
      return [0, 100]
    }

    // Start and end are the same
    if (extent[0] === extent[1]) {
      let val: number = extent[0]
      // This is somewhat arbitrary but we have to come up with something...
      // We return here as no further processing (smart, cut, zero) is possible
      return val === 0
        ? [0, 100]
        // Make sure axis has right direction
        : (val < 0 ? [2 * val, val] : [val, 2 * val])
    }

    switch (expand) {
      case "smart":
        return this.extentCushion(this.extentSmart(extent))
      case "zero":
        return this.extentCushion(this.extentZero(extent))
      case "cut":
        return this.extentCushion(extent)
      default:
        throw new Error("Invalid expand option '" + expand + "'.")
    }
  },

  ruleClass: function(ruleValue: number, index: number, ticks: number[]): string {
    return index === ticks.indexOf(0) ? "zero" : ""
  },

  // Formats the numbers on a quant axis and replaces the last tick with a unit tick, if provided.
  tickFormatter: function(step: number, unitTick: number, displayUnit: string): (num: number) => number | string {
    let exp: number = -Math.floor(Math.log(step) / Math.LN10)
    let expMatch: number = 3 * Math.round(exp / 3)
    let expMax: number = Math.max(exp, expMatch)
    let suffix: string = ({ 0: "", 3: "k", 6: "m", 9: "bn" } as any)[-expMatch]

    return suffix != null
      ? function(num: number): number | string {
        if (num === unitTick) { return displayUnit }
        let display: number = Math.round(num * Math.pow(10, expMax)) / +Math.pow(10, expMax - expMatch).toFixed(expMax - expMatch)
        return display === 0 ? display : display + suffix
      }
      : function(num: number): number | string {
        if (num === unitTick) { return displayUnit }
        return num % 1 === 0 ? num : num.toFixed(2)
      }
  }

}

export default QuantAxisUtils
