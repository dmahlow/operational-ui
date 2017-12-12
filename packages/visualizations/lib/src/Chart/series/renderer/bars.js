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
var fp_1 = require("lodash/fp");
var d3 = require("d3-selection");
function anchor(scale, baseline) {
    return function (d) {
        var v = scale(d);
        return (v > baseline) ? baseline : v;
    };
}
function length(scale, baseline) {
    return function (d) {
        return Math.max(Math.abs(scale(d) - baseline), 1) || 0;
    };
}
function guardNaN(funcOrConst) {
    var func = functor(funcOrConst);
    return function (d, i) { return func(d, i) || 0; };
}
function functor(funcOrConst) {
    return fp_1.isFunction(funcOrConst) ? funcOrConst : function () { return funcOrConst; };
}
var Bars = /** @class */ (function (_super) {
    __extends(Bars, _super);
    function Bars() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.accessor = "rect";
        _this.type = "bars";
        return _this;
    }
    // Initialize
    Bars.prototype.initialize = function () {
        this.barWidth = this.options.width;
    };
    Bars.prototype.color = function () {
        return this.series.color();
    };
    // Event handlers
    // We need to get d3 element from context, can't bind onClick to this
    Bars.prototype.onMouseOver = function (ctx) {
        return function (d, i) {
            var bar = d3.select(this);
            ctx.mouseOver(bar, d);
        };
    };
    Bars.prototype.mouseOver = function (bar, datum) {
        var color = functor(this.color()), colorHex = color(datum);
        var focusPoint;
        var isNegative;
        if (this.yIsBaseline()) {
            // get x and dimensions from svg element (easier than to compute offset again), make sure to cast from string
            isNegative = this.previousDraw.y(datum) === this.baseline.computed.baseline;
            focusPoint = fp_1.extend({
                color: colorHex,
                colorHex: colorHex,
                label: this.state.current.get("config").focusFormatter(datum[this.series.dataIndeces()["x"]]),
                labelPosition: isNegative ? "below" : "above",
                width: +bar.attr("width"),
                x: +bar.attr("x"),
                y: this.previousDraw.y(datum) + (isNegative ? +bar.attr("height") : 0)
            })(this.series.focusPoint(this.series.xAxis(), datum[this.series.dataIndeces()["x"]]));
        }
        else {
            // get y and dimensions from svg element (easier than to compute offset again), make sure to cast from string
            isNegative = this.previousDraw.x(datum) < this.baseline.computed.baseline;
            focusPoint = fp_1.extend({
                color: colorHex,
                colorHex: colorHex,
                height: +bar.attr("height"),
                label: this.state.current.get("config").focusFormatter(datum[this.series.dataIndeces()["y"]]),
                labelPosition: isNegative ? "toLeft" : "toRight",
                x: this.previousDraw.x(datum) + (isNegative ? 0 : +bar.attr("width")),
                y: +bar.attr("y") + +bar.attr("height") / 2
            })(this.series.focusPoint(this.series.yAxis(), datum[this.series.dataIndeces()["y"]]));
        }
        // During transitions, if a mouseover event is triggered on an element that is not in the new data,
        // before the bar transition has been called (i.e. before .on("mouseenter", null) has been called),
        // no focusPoint will be defined in the series -
        // this.series.hasData() returns false, so this.series.focusPoint(...) returns undefined
        if (focusPoint === undefined) {
            return;
        }
        // this.state.trigger(Events.FOCUS.ELEMENT.HOVER, focusPoint)
        bar
            .classed("hover", true)
            .on("mouseleave", function () {
            // this.state.trigger(Events.FOCUS.ELEMENT.OUT)
            bar.classed("hover", false);
        });
    };
    // Helpers
    Bars.prototype.computeBarDimension = function (axis) {
        var _this = this;
        var config = this.state.current.get("config"), computedCanvas = this.state.current.get("computed").canvas;
        return function (d, i) {
            return Math.min(Math.max(axis.barSeries.find(function (s) { return s.key === _this.series.key(); }).barDimension - config.barPadding, config.minBarWidth), (_this.yIsBaseline() ? computedCanvas.drawingContainerDims.width : computedCanvas.drawingContainerDims.height) * config.maxBarWidthRatio);
        };
    };
    Bars.prototype.computeBarTranslation = function (axis, barWidth) {
        var _this = this;
        return function (d, i) {
            var translation = Math.abs(functor(barWidth)(d, i) / 2 - axis.barSeries.find(function (s) { return s.key === _this.series.key(); }).barDimension / 2);
            return _this.yIsBaseline() ? "translate(" + translation + ", 0)" : "translate(0, " + translation + ")";
        };
    };
    Bars.prototype.prepareData = function (axis, scale, name) {
        return fp_1.flow(fp_1.filter(this.dataFilter.bind(this)(axis, scale, name)), fp_1.sortBy(scale))(this.series.dataPoints);
    };
    // Drawing
    Bars.prototype.prepareDraw = function () {
        _super.prototype.prepareDraw.call(this);
        if (!this.discrete) {
            throw new Error("bars renderer needs a discrete axis (time or ordinal)");
        }
        // Keying function for bars
        var index = this.discrete.index;
        this.key = function (d) { return d[index]; };
    };
    Bars.prototype.data = function (x, y) {
        return this.yIsBaseline() ? this.prepareData(this.x, x, "x") : this.prepareData(this.y, y, "y");
    };
    Bars.prototype.getAttributes = function (x, y, baseline) {
        var _this = this;
        // Vertical columns
        var that = this;
        var translation;
        var stacked;
        var currentDraw;
        var offset = function (axisName) {
            var type = _this.state.current.get("accessors").data.axes(_this.state.current.get("data"))[axisName].type, computed = _this.state.current.get("computed").axes[axisName].computed, index = _this.series.dataIndeces()[axisName[0]];
            return type === "time"
                ? function (d) { return computed.adjustedBarOffset(d[index], that.series.barIndex) - computed.halfTickWidth; }
                : computed.barSeries.find(function (s) { return s.key === that.series.key(); }).barOffset - computed.halfTickWidth;
        };
        if (this.yIsBaseline()) {
            var barWidth = this.barWidth || this.computeBarDimension(this.x);
            translation = this.computeBarTranslation(this.x, barWidth);
            // if (this.series.y.relativeIndex) {
            //   let dataIsNegative: boolean = every(map((d: any): boolean => {
            //     return d[this.series.y.runningIndex] <= 0
            //   })(this.data(x, y)))
            //   stacked = dataIsNegative
            //     ? this.axisScale(this.y.axis.computed.scale, this.series.y.relativeIndex)
            //     : this.axisScale(this.y.axis.computed.scale, this.series.y.runningIndex)
            // }
            currentDraw = {
                height: length(y, baseline),
                translation: translation,
                width: barWidth,
                x: guardNaN(function (d) { return x(d) + functor(offset(_this.series.xAxis()))(d); }),
                y: guardNaN(stacked || anchor(y, baseline))
            };
            // Horizontal bars
        }
        else {
            var barHeight = this.barWidth || this.computeBarDimension(this.y);
            translation = this.computeBarTranslation(this.y, barHeight);
            // if (this.series.x.relativeIndex) {
            //   let dataIsNegative: boolean = every(map((d: any): boolean => {
            //     return d[this.series.x.runningIndex] <= 0
            //   })(this.data(x, y)))
            //   stacked = dataIsNegative
            //     ? this.axisScale(this.x.axis.computed.scale, this.series.x.runningIndex)
            //     : this.axisScale(this.x.axis.computed.scale, this.series.x.relativeIndex)
            // }
            currentDraw = {
                height: barHeight,
                translation: translation,
                width: length(x, baseline),
                x: guardNaN(stacked || anchor(x, baseline)),
                y: guardNaN(function (d) { return y(d) + functor(offset(that.y.axis, that.y.index))(d); })
            };
        }
        return currentDraw;
    };
    Bars.prototype.getStartAttributes = function (x, y, baseline, currentDraw) {
        var yIsBaseline = this.yIsBaseline();
        var xStart = yIsBaseline ? currentDraw.x : baseline;
        var yStart = yIsBaseline ? baseline : currentDraw.y;
        var translation = yIsBaseline
            ? this.computeBarTranslation(this.x, this.computeBarDimension(this.x))
            : this.computeBarTranslation(this.y, this.computeBarDimension(this.y));
        return fp_1.defaults(currentDraw)({ translation: translation, x: xStart, y: yStart });
    };
    Bars.prototype.getCollapseAttributes = function (x, y, baseline) {
        var yIsBaseline = this.yIsBaseline();
        // Vertical columns
        return {
            height: yIsBaseline ? 0 : 10,
            width: yIsBaseline ? 10 : 0,
            x: yIsBaseline ? this.axisScale(this.x.axis.previous.scale, this.x.index) : baseline,
            y: yIsBaseline ? baseline : this.axisScale(this.y.axis.previous.scale, this.y.index)
        };
    };
    Bars.prototype.setAttributes = function (selection, attributes, ctx, duration) {
        d3_utils_1.setRectAttributes(selection, fp_1.extend({ color: ctx.color() })(attributes), duration);
        selection.attr("class", attributes.className || "");
    };
    Bars.prototype.enterSelection = function (data, attributes) {
        _super.prototype.enterSelection.call(this, data, attributes);
        this.el.selectAll("rect")
            .attr("transform", attributes.translation);
    };
    Bars.prototype.transitionSelection = function (data, attributes, duration, onTransitionEnd) {
        if (onTransitionEnd === void 0) { onTransitionEnd = undefined; }
        _super.prototype.transitionSelection.call(this, data, attributes, duration, onTransitionEnd);
        this.el.selectAll("rect")
            .attr("transform", attributes.translation);
    };
    return Bars;
}(abstract_renderer_1.default));
exports.default = Bars;
//# sourceMappingURL=bars.js.map