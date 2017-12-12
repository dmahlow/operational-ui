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
var textlabel_formatter_1 = require("../../../utils/textlabel_formatter");
var d3_utils_1 = require("../../../utils/d3_utils");
var fp_1 = require("lodash/fp");
function guardNaN(funcOrConst) {
    var func = fp_1.isFunction(funcOrConst) ? funcOrConst : function () { return funcOrConst; };
    return function (d, i) {
        return func(d, i) || 0;
    };
}
var TextLabels = /** @class */ (function (_super) {
    __extends(TextLabels, _super);
    function TextLabels() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "textlabels";
        _this.accessor = "text";
        return _this;
    }
    // Helpers
    // Gives coordinates of each series when stacked
    TextLabels.prototype.getPosition = function (axisName, scale) {
        // return this.series[axisName].runningIndex
        //   ? this.axisScale(this[axisName].axis.computed.scale, this.series[axisName].runningIndex)
        //   : scale
        return scale;
    };
    // Calculate offset of text labels from rendered points.
    TextLabels.prototype.calculateOffset = function () {
        // return this.series.hasRenderer("bars")
        //   ? this.state.options.textlabels.offset.default
        //   : this.state.options.textlabels.offset[this.series.hasRenderer("points") ? "points" : "default"]
        return this.state.current.get("config").textlabels.offset.default;
    };
    // The labels need to be offset according to series type: if bars, the labels need to be centred.
    TextLabels.prototype.calculateStart = function (axis, scale) {
        // if (this.series.hasRenderer("bars")) {
        //   let computed: any = axis.axis.computed
        //   let barIndex: number = this.series.barIndex
        //   let barCenterOffset: number = computed.barOffset.rangeBand() / 2
        //   let offset: any = axis.axis.type === "time"
        //     ? function(d: any): number { return computed.adjustedBarOffset(d[axis.index], barIndex) - computed.tickWidth / 2 }
        //     : computed.barOffset(barIndex) - computed.tickWidth / 2
        //   return function(d: any): number { return Math.round(scale(d)) + d3.functor(offset)(d) + barCenterOffset }
        // } else {
        return scale;
        // }
    };
    TextLabels.prototype.labelText = function () {
        var _this = this;
        // return (d: any): string => this.series.displayFormatter()(d[this.baseline.index])
        var index = this.series.dataIndeces()[this.baseline.axis[0]];
        return function (d) { return _this.state.current.get("config").numberFormatter(d[index]); };
    };
    TextLabels.prototype.data = function (x, y) {
        return this.yIsBaseline() ? this.prepareData(this.x, x, "x") : this.prepareData(this.y, y, "y");
    };
    TextLabels.prototype.prepareData = function (axis, scale, name) {
        return fp_1.flow(fp_1.filter(this.dataFilter.bind(this)(axis, scale, name)), fp_1.filter(function (d) { return d[1] != null; }))(this.series.dataPoints);
    };
    TextLabels.prototype.getAttributes = function (x, y, baseline) {
        // store calculations for this draw so they can be used for transition in next draw
        var currentDraw = {};
        var rotate;
        var offsetLabel = this.calculateOffset();
        if (this.yIsBaseline()) {
            currentDraw.x = guardNaN(this.calculateStart(this.x, x));
            currentDraw.y = guardNaN(this.getPosition("y", y));
            rotate = this.state.current.get("config").textlabels.rotate.vertical;
            currentDraw.textAnchor = textlabel_formatter_1.default.rotatedTextAnchor(this.state.current.get("computed").canvas.drawingHeight, currentDraw.y, offsetLabel, this.y.index, rotate);
            // dx and dy need to be calculated based on offsetLabel, textAnchor, x & y positions and rotation
            // If textlabels are on only bars or bar lines, they should be centered.
            // let center: boolean = this.series.hasOnlyRenderer(["bars", "bar_line"])
            var center = false;
            currentDraw.dx = textlabel_formatter_1.default.rotatedDx(currentDraw.textAnchor, offsetLabel, rotate, center);
            currentDraw.dy = textlabel_formatter_1.default.rotatedDy(currentDraw.textAnchor, offsetLabel, rotate, center);
        }
        else {
            currentDraw.x = guardNaN(this.getPosition("x", x));
            currentDraw.y = guardNaN(this.calculateStart(this.y, y));
            rotate = this.state.current.get("config").textlabels.rotate.horizontal;
            var labelPosition_1 = textlabel_formatter_1.default.horizontalLabelPosition(this.state.current.get("computed").canvas.drawingWidth, currentDraw.x, offsetLabel, this.x.index);
            currentDraw.textAnchor = function (d) { return labelPosition_1(d, this).textAnchor; };
            currentDraw.dx = function (d) { return labelPosition_1(d, this).dx; };
            currentDraw.dy = ".35em";
        }
        currentDraw.transform = function (d) {
            return "rotate(" + rotate + " " + currentDraw.x(d) + " " + currentDraw.y(d) + ")";
        };
        currentDraw.labelText = this.labelText();
        return currentDraw;
    };
    TextLabels.prototype.getStartAttributes = function (x, y, baseline, currentDraw) {
        // Need to position labels from different side depending on whether baseline is on x or y
        return {
            x: this.yIsBaseline() ? currentDraw.x : baseline,
            y: this.yIsBaseline() ? baseline : currentDraw.y
        };
    };
    TextLabels.prototype.getCollapseAttributes = function (x, y, baseline) {
        // Need to collapse points differently depending on whether baseline is on x or y
        return {
            x: this.yIsBaseline() ? this.axisScale(this.x.axis.previous.scale, this.x.index) : baseline,
            y: this.yIsBaseline() ? baseline : this.axisScale(this.y.axis.previous.scale, this.y.index)
        };
    };
    TextLabels.prototype.prepareDraw = function () {
        _super.prototype.prepareDraw.call(this);
        // Keying function for text labels
        // let index: number = this.discrete ? this.discrete.index : this.mappings.x.index
        var index = this.series.dataIndeces()[this.baseline.axis[0]];
        this.key = function (d) { return d[index]; };
    };
    TextLabels.prototype.setAttributes = function (selection, attributes, ctx, duration) {
        selection.call(d3_utils_1.setTextAttributes, fp_1.extend({ labelText: ctx.labelText() })(attributes), duration);
    };
    return TextLabels;
}(abstract_renderer_1.default));
exports.default = TextLabels;
//# sourceMappingURL=textlabels.js.map