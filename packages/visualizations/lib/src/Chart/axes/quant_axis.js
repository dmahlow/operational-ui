"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_axis_1 = require("./abstract_axis");
var quant_axis_utils_1 = require("../../utils/quant_axis_utils");
var fp_1 = require("lodash/fp");
var QuantAxis = /** @class */ (function (_super) {
    __extends(QuantAxis, _super);
    function QuantAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseline = true;
        _this.dataType = "number";
        _this.discrete = false;
        return _this;
    }
    QuantAxis.prototype.updateOptions = function (options) {
        this.expand = options.expand || this.expand || "zero";
        // if fixed start and / or end
        if (options.start) {
            this.start = options.start;
        }
        if (options.end) {
            this.end = options.end;
        }
        if (this.start && this.end && this.start === this.end) {
            this.end = this.start + 1;
        }
    };
    QuantAxis.prototype.ruleClass = function (ruleValue, index) {
        return quant_axis_utils_1.default.ruleClass(ruleValue, index, this.computed.ticks);
    };
    QuantAxis.prototype.hasRules = function () {
        return this.data().length > 0;
    };
    // Computations
    // Update axis computations and ticks
    //
    // Rule: everything that goes into "computed" is passed into compute functions, never
    // access this.computed directly from within a function!
    QuantAxis.prototype.computeAxisInformation = function (computed) {
        var options = this.state.current.get("config")[this.name];
        computed.domain = quant_axis_utils_1.default.computeDomain(this.data(), this.start, this.end, this.expand);
        computed.steps = quant_axis_utils_1.default.computeSteps(computed.domain, computed.range, options.tickSpacing, options.minTicks);
        computed.ticks = quant_axis_utils_1.default.computeTicks(computed.steps);
        computed.scale = quant_axis_utils_1.default.computeScale(computed.range, computed.ticks);
        computed.baseline = this.computeBaseline(computed.domain, computed.scale);
        // Set flag whether graphical transition from earlier
        // values should be attempted
        computed.transition = true;
    };
    QuantAxis.prototype.computePreAlignment = function () {
        var options = this.state.current.get("config")[this.name];
        var computed = {};
        computed.range = this.computeRange();
        computed.rangeDirection = this.computeRangeDirection(computed.range);
        computed.domain = quant_axis_utils_1.default.computeDomain(this.data(), this.start, this.end, this.expand);
        computed.steps = quant_axis_utils_1.default.computeSteps(computed.domain, computed.range, options.tickSpacing, options.minTicks);
        return computed;
    };
    QuantAxis.prototype.computeAligned = function (computed) {
        this.previous = this.computed;
        computed.domain = computed.steps.slice(0, 2);
        computed.ticks = quant_axis_utils_1.default.computeTicks(computed.steps);
        computed.scale = quant_axis_utils_1.default.computeScale(computed.range, computed.ticks);
        computed.baseline = this.computeBaseline(computed.domain, computed.scale);
        this.computed = computed;
        this.previous = fp_1.defaults(this.previous, this.computed);
        // Set flag whether graphical transition from earlier
        // values should be attempted
        this.computed.transition = this.drawn;
        this.stateWriter(["computed"], this.computed);
    };
    // Needed for bar and area charts
    // depends on whether domain is ascending or descending
    // and on whether it includes 0
    QuantAxis.prototype.computeBaseline = function (domain, scale) {
        var i;
        var j;
        var low;
        var high;
        _a = quant_axis_utils_1.default.axisDirection(domain), i = _a[0], j = _a[1];
        low = domain[i];
        high = domain[j];
        return scale(low > 0 ? low : (high < 0 ? high : 0));
        var _a;
    };
    // Drawing
    QuantAxis.prototype.tickFormatter = function (unitTick) {
        return this.state.current.get("config").numberFormatter;
    };
    QuantAxis.prototype.tickMapper = function () {
        return Number;
    };
    // Align Axes
    QuantAxis.prototype.align = function (other) {
        var partialOne = this.computePreAlignment();
        var partialTwo = other.computePreAlignment();
        QuantAxis.alignSteps(partialOne.steps, partialTwo.steps);
        this.computeAligned(partialOne);
        other.computeAligned(partialTwo);
    };
    // Aligns Zeros if both domains have zeros otherwise aligns number of ticks
    // Expects steps to be an array of [start, stop, step]
    QuantAxis.alignSteps = function (one, two) {
        function containsZero(step) {
            return (step[0] <= 0 && step[1] >= 0) ? [Math.abs(step[0] / step[2]), step[1] / step[2]] : undefined;
        }
        var zeroOne = containsZero(one), zeroTwo = containsZero(two);
        if (zeroOne && zeroTwo) {
            var max = [
                Math.max(zeroOne[0], zeroTwo[0]),
                Math.max(zeroOne[1], zeroTwo[1])
            ];
            one[0] = one[0] - (max[0] - zeroOne[0]) * one[2];
            one[1] = one[1] + (max[1] - zeroOne[1]) * one[2];
            two[0] = two[0] - (max[0] - zeroTwo[0]) * two[2];
            two[1] = two[1] + (max[1] - zeroTwo[1]) * two[2];
        }
        else {
            var stepsL = (one[1] - one[0]) / one[2];
            var stepsR = (two[1] - two[0]) / two[2];
            var stepsDiff = stepsL - stepsR;
            if (stepsDiff > 0) {
                two[0] = two[0] - Math.floor(stepsDiff / 2) * two[2];
                two[1] = two[1] + Math.ceil(stepsDiff / 2) * two[2];
            }
            else if (stepsDiff < 0) {
                one[0] = one[0] + Math.ceil(stepsDiff / 2) * one[2];
                one[1] = one[1] - Math.floor(stepsDiff / 2) * one[2];
            }
        }
    };
    return QuantAxis;
}(abstract_axis_1.default));
exports.default = QuantAxis;
//# sourceMappingURL=quant_axis.js.map