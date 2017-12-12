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
var fp_1 = require("lodash/fp");
var d3_scale_1 = require("d3-scale");
var OrdinalAxis = /** @class */ (function (_super) {
    __extends(OrdinalAxis, _super);
    function OrdinalAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.baseline = false;
        _this.dataType = "string";
        _this.discrete = true;
        return _this;
    }
    OrdinalAxis.prototype.updateOptions = function (options) {
        this.values = options.values || this.values;
    };
    OrdinalAxis.prototype.guess = function (data) {
        // @TODO: implement sorting of mixed strings
        // return Sort.sortMixedStrings()(uniq(data))
        return fp_1.sortBy(function (d) { return d; })(fp_1.uniq(data));
    };
    OrdinalAxis.prototype.hasRules = function () {
        return false;
    };
    // Computations
    // Update axis computations and ticks
    //
    // Rule: everything that goes into "computed" is passed into compute functions, never
    // access this.computed directly from within a function!
    OrdinalAxis.prototype.computeAxisInformation = function (computed) {
        computed.domain = this.computeDomain();
        computed.tickNumber = this.computeTickNumber(computed.domain);
        computed.ticksInDomain = computed.tickNumber; // for ordinal axis, this is the same
        computed.tickWidth = computed.width / computed.ticksInDomain;
        // tickWidth too small, adjust...
        // This will result in bars possibly overflowing the svg drawing area
        // - but looks still better than drawing all bars on top of each other
        var config = this.state.current.get("config");
        var minTickWidth = Math.max(config.minBarTickWidth.ordinal, config.minBarWidth * computed.numberOfBars);
        if (computed.tickWidth < minTickWidth) {
            computed.tickWidth = minTickWidth;
            computed.width = computed.ticksInDomain * computed.tickWidth;
            computed.range = this.computeAdjustedRange(computed.width);
        }
        // Used in many computations
        computed.halfTickWidth = computed.tickWidth / 2;
        // Ordinal scale will return the beginning of each range band,
        // to move that to the middle (as needed for non-bar renderers)
        // we shift the range we use to create the scale by half a tick
        var shiftedRange = [
            computed.range[0] + computed.halfTickWidth,
            computed.range[1] + computed.halfTickWidth
        ];
        var numberOfBars = this.state.current.get("computed").series.axes[this.name].barSeries.length;
        if (numberOfBars > 0) {
            computed.barSeries = this.computeBarSeries(computed);
        }
        computed.scale = this.computeScale(shiftedRange, computed.domain);
        computed.ticks = computed.domain;
    };
    OrdinalAxis.prototype.computeBarSeries = function (computed) {
        var barSeries = this.state.current.get("computed").series.axes[this.name].barSeries;
        computed.barOffsetScale = this.computeBarOffset(barSeries, computed.tickWidth);
        this.computeBarDimension(computed, barSeries);
        return barSeries;
    };
    OrdinalAxis.prototype.computeAligned = function (computed) { };
    OrdinalAxis.prototype.computeDomain = function () {
        return this.values || this.guess(this.data());
    };
    OrdinalAxis.prototype.computeTickNumber = function (domain) {
        return domain.length;
    };
    OrdinalAxis.prototype.computeScale = function (range, domain) {
        return d3_scale_1.scaleBand().domain(domain).range(range);
    };
    OrdinalAxis.prototype.computeBarDimension = function (computed, barSeries) {
        fp_1.forEach(function (series) {
            series.barDimension = computed.barOffsetScale.bandwidth();
        })(barSeries);
    };
    // Drawing
    OrdinalAxis.prototype.tickFormatter = function () {
        return String;
    };
    OrdinalAxis.prototype.tickMapper = function () {
        return String;
    };
    // Align Axes
    OrdinalAxis.prototype.align = function (other) {
        this.compute();
        other.computeAligned(this.computed);
    };
    return OrdinalAxis;
}(abstract_axis_1.default));
exports.default = OrdinalAxis;
//# sourceMappingURL=ordinal_axis.js.map