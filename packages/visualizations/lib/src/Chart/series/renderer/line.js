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
var abstract_renderer_1 = require("./abstract_renderer");
var d3_utils_1 = require("../../../utils/d3_utils");
var d3 = require("d3-selection");
var d3_shape_1 = require("d3-shape");
var fp_1 = require("lodash/fp");
function defined(scale) {
    return fp_1.isFunction(scale)
        ? function (d) { return !isNaN(scale(d)); }
        : function () { return true; };
}
// this.options
// "interpolate" - "monotone" etc. - see d3 documentation
// "dashed" - dashed style
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.accessor = "path";
        _this.type = "line";
        return _this;
    }
    Line.prototype.initialize = function () {
        var _this = this;
        // Line path generator
        var interpolator = this.options.interpolate || undefined;
        this.line = function (x, y) {
            return d3_shape_1.line()
                .x(x)
                .y(y)
                .defined(defined(_this.yIsBaseline() ? y : x));
        };
    };
    // Workaround - we need to get d3 element from context
    Line.prototype.onMouseOver = function (ctx) {
        return function (d, i) {
            var path = d3.select(this);
            ctx.mouseOver(path, d);
        };
    };
    Line.prototype.mouseOver = function (path, data) {
        path
            .classed("hover", true)
            .on("mouseout", function () {
            path.classed("hover", false);
        });
    };
    Line.prototype.prepareData = function (axis, scale, name) {
        // The d3 stack layout considers missing data to be = 0, which automatically closes gaps.
        // If the gaps shouldn't be closed, the relevant values need to be reset to undefined.
        if (this.series.stacked && !this.options.closeGaps) {
            fp_1.flow(fp_1.filter(function (d) { return d[1] === null; }), fp_1.forEach(function (d) { return d[2] = d[3] = undefined; }))(this.series.dataPoints);
        }
        // return !this.options.closeGaps && axis.options.addMissingDatapoints != null
        //   ? axis.axis.addMissingDatapoints(this.series.dataPoints, axis.index)
        //   : sortBy(scale)(this.series.dataPoints)
        return fp_1.flow(fp_1.filter(this.dataFilter.bind(this)(axis, scale, name)), fp_1.sortBy(scale))(this.series.dataPoints);
    };
    Line.prototype.color = function (ctx) {
        return ctx.series.colorHex;
    };
    Line.prototype.data = function (x, y) {
        return this.yIsBaseline() ? [this.prepareData(this.x, x, "x")] : [this.prepareData(this.y, y, "y")];
    };
    Line.prototype.getAttributes = function (x, y, baseline) {
        // store calculations for this draw so they can be used for transition in next draw
        var currentDraw = {};
        currentDraw.pointsDrawn = this.series.dataPoints.length;
        // If data is stacked, the running total should be used rather than the absolute value.
        // if (this.series.y.runningIndex) {
        //   currentDraw.path = this.line(x, this.axisScale(this.y.axis.computed.scale, this.series.y.runningIndex))
        // } else if (this.series.x.runningIndex) {
        //   currentDraw.path = this.line(this.axisScale(this.x.axis.computed.scale, this.series.x.runningIndex), y)
        // } else {
        currentDraw.path = this.line(x, y);
        // }
        return currentDraw;
    };
    Line.prototype.getStartAttributes = function (x, y, baseline) {
        return { path: this.yIsBaseline() ? this.line(x, baseline) : this.line(baseline, y) };
    };
    Line.prototype.getCollapseAttributes = function (x, y, baseline) {
        // Need to collapse line differently depending on whether baseline is on x or y
        var axis = this.yIsBaseline() ? this.x : this.y;
        var scale = this.axisScale(axis.axis.computed.scale, axis.index);
        return {
            opacity: 1e-6,
            path: this.yIsBaseline() ? this.line(scale, baseline) : this.line(baseline, scale)
        };
    };
    Line.prototype.setAttributes = function (selection, attributes, ctx, duration) {
        d3_utils_1.setPathAttributes(selection, fp_1.extend({ stroke: ctx.series.color() })(attributes), duration);
    };
    return Line;
}(abstract_renderer_1.default));
exports.default = Line;
//# sourceMappingURL=line.js.map