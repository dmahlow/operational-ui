"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = require("lodash/fp");
var d3_scale_1 = require("d3-scale");
var d3_array_1 = require("d3-array");
function stepScaleFactors(step) {
    return step === 1
        ? [10, 5, 2, 1]
        : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
}
// Axis Formatting
var QuantAxisUtils = {
    // Public Functions
    // These functions are not included directly in the base quant axis class
    // because they are also required by the chart quant axis class, which does
    // not extend the base quant axis class. Step and tick calculation is also
    // used elsewhere, e.g. in the cohort chart row focus.
    // Expand extent
    axisDirection: function (extent) {
        return extent[1] > extent[0] ? [0, 1] : [1, 0];
    },
    computeDomain: function (data, start, end, expand) {
        var extent = this.guess(data, expand);
        return [start || extent[0], end || extent[1]];
    },
    computeScale: function (range, ticks) {
        return d3_scale_1.scaleLinear().range(range).domain(d3_array_1.extent(ticks));
    },
    // Computes nice steps (for ticks) given a domain [start, stop] and a
    // wanted number of ticks (number of ticks returned might differ
    // by a few ticks)
    computeSteps: function (domain, range, spacing, minTicks) {
        var tickNumber = this.computeTickNumber(range, spacing, minTicks), span = domain[1] - domain[0];
        var step = Math.pow(10, Math.floor(Math.log(Math.abs(span) / tickNumber) / Math.LN10)), scaleFactor;
        if (span < 0) {
            step = step * -1;
        }
        if (this.end) {
            // If a value has been explicitly set for this.end, there must be a tick at this value
            var validScaleFactors = fp_1.filter(function (val) { return span / (step * val) % 1 === 0; })(stepScaleFactors(step));
            // Choose scale factor which gives a number of ticks as close as possible to tickNumber
            scaleFactor = fp_1.sortBy(function (val) { return Math.abs(span / (val * step) - tickNumber); })(validScaleFactors)[0];
        }
        else {
            var err = tickNumber / span * step;
            if (err <= .15) {
                scaleFactor = 10;
            }
            else if (err <= .35) {
                scaleFactor = 5;
            }
            else if (err <= .75) {
                scaleFactor = 2;
            }
            else {
                scaleFactor = 1;
            }
        }
        step *= scaleFactor;
        return [
            Math.floor(domain[0] / step) * step,
            Math.ceil(domain[1] / step) * step,
            step // step
        ];
    },
    computeTickNumber: function (range, tickSpacing, minTicks) {
        if (minTicks === void 0) { minTicks = 0; }
        var length = Math.abs(range[0]) + Math.abs(range[1]);
        return Math.max(Math.floor(length / tickSpacing), minTicks);
    },
    computeTicks: function (steps) {
        var ticks = d3_array_1.range(steps[0], steps[1], steps[2]);
        ticks.push(steps[1]);
        if (fp_1.last(ticks) < 0) {
            ticks.push(0);
        }
        return ticks;
    },
    // Increase the extent by 5% on both sides (so that there's some space
    // between the drawings and the borders of the chart), unless one of the ends
    // equals 0
    extentCushion: function (extent) {
        var _a = this.axisDirection(extent), i = _a[0], j = _a[1];
        var distance = extent[j] - extent[i];
        if (extent[i] !== 0) {
            extent[i] = extent[i] - (0.05 * distance);
        }
        if (extent[j] !== 0) {
            extent[j] = extent[j] + (0.05 * distance);
        }
        return extent;
    },
    // Decides whether to cut axis to values based on how big the gap between start / end is
    extentSmart: function (extent) {
        var _a = this.axisDirection(extent), i = _a[0], j = _a[1];
        var distance = extent[j] - extent[i];
        var ratio = extent[i] > 0 ? distance / extent[i] : distance / Math.abs(extent[j]);
        // No ratio if zero is already included
        return (!ratio || ratio < 0.2) ? extent : this.extentZero(extent);
    },
    // Expands an extent [start, end] to include zero as start or end
    // if it does not already contain zero
    extentZero: function (extent) {
        var _a = this.axisDirection(extent), i = _a[0], j = _a[1];
        if (extent[i] > 0) {
            extent[i] = 0;
        }
        else if (extent[j] < 0) {
            extent[j] = 0;
        }
        return extent;
    },
    // Guess start, end from data
    guess: function (data, expand) {
        if (data === void 0) { data = []; }
        var extent = d3_array_1.extent(data);
        // If this axis is user configured but does not currently have any data,
        // we still need to guess some extent here - otherwise animations will blow up
        if (fp_1.isUndefined(extent[0])) {
            return [0, 100];
        }
        // Start and end are the same
        if (extent[0] === extent[1]) {
            var val = extent[0];
            // This is somewhat arbitrary but we have to come up with something...
            // We return here as no further processing (smart, cut, zero) is possible
            return val === 0
                ? [0, 100]
                // Make sure axis has right direction
                : (val < 0 ? [2 * val, val] : [val, 2 * val]);
        }
        switch (expand) {
            case "smart":
                return this.extentCushion(this.extentSmart(extent));
            case "zero":
                return this.extentCushion(this.extentZero(extent));
            case "cut":
                return this.extentCushion(extent);
            default:
                throw new Error("Invalid expand option '" + expand + "'.");
        }
    },
    ruleClass: function (ruleValue, index, ticks) {
        return index === ticks.indexOf(0) ? "zero" : "";
    },
    // Formats the numbers on a quant axis and replaces the last tick with a unit tick, if provided.
    tickFormatter: function (step, unitTick, displayUnit) {
        var exp = -Math.floor(Math.log(step) / Math.LN10);
        var expMatch = 3 * Math.round(exp / 3);
        var expMax = Math.max(exp, expMatch);
        var suffix = { 0: "", 3: "k", 6: "m", 9: "bn" }[-expMatch];
        return suffix != null
            ? function (num) {
                if (num === unitTick) {
                    return displayUnit;
                }
                var display = Math.round(num * Math.pow(10, expMax)) / +Math.pow(10, expMax - expMatch).toFixed(expMax - expMatch);
                return display === 0 ? display : display + suffix;
            }
            : function (num) {
                if (num === unitTick) {
                    return displayUnit;
                }
                return num % 1 === 0 ? num : num.toFixed(2);
            };
    }
};
exports.default = QuantAxisUtils;
//# sourceMappingURL=quant_axis_utils.js.map