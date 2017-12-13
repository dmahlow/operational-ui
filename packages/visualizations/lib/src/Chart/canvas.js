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
var drawing_canvas_1 = require("../utils/drawing_canvas");
var event_catalog_1 = require("../utils/event_catalog");
var d3 = require("d3-selection");
var fp_1 = require("lodash/fp");
var seriesElements = [
    // ["area", "drawing_clip"],
    // ["range", "drawing_clip"],
    ["bars", "drawing_clip"],
    // ["bar_line", "drawing_clip"],
    // ["event_flag", "drawing_clip"],
    ["line", "drawing_clip"],
    // ["circles", "drawing_clip"],
    // ["trend", "drawing_clip"],
    // ["points", "xyrules_clip"],
    ["textlabels", "yrules_clip"]
];
var legendOptions = [
    ["top", "left"],
    ["top", "right"],
    ["bottom", "left"]
];
var Canvas = /** @class */ (function (_super) {
    __extends(Canvas, _super);
    function Canvas(state, stateWriter, events, context) {
        var _this = _super.call(this, state, stateWriter, events, context) || this;
        _this.mousePosition = _this.initialMousePosition();
        _this.appendClipPaths();
        _this.appendBackground();
        _this.appendDrawingGroup();
        _this.appendAxisElements();
        _this.appendSeriesDrawingGroups(seriesElements);
        _this.appendFocus();
        fp_1.forEach(function (options) { return _this.insertLegend(options[0], options[1]); })(legendOptions);
        _this.stateWriter("elements", _this.elements);
        return _this;
    }
    Canvas.prototype.createEl = function () {
        return d3.select(document.createElementNS(d3.namespaces["svg"], "svg"));
    };
    Canvas.prototype.appendClipPaths = function () {
        this.appendDrawingClip();
        this.appendYRulesClip();
        this.appendXYRulesClip();
    };
    Canvas.prototype.appendXYRulesClip = function () {
        this.elements.defs.append("clipPath")
            .attr("class", "chart-clip-path")
            .attr("id", this.xyRulesDefinitionId())
            .append("rect");
    };
    Canvas.prototype.xyRulesDefinitionId = function () {
        return this.prefixedId("_xyrules_clip");
    };
    Canvas.prototype.initialMousePosition = function () {
        return {
            absolute: {
                x: undefined,
                y: undefined
            },
            relative: {
                x: undefined,
                y: undefined
            }
        };
    };
    Canvas.prototype.seriesElements = function () {
        return seriesElements;
    };
    Canvas.prototype.appendAxisElements = function () {
        var axes = ["y", "x"];
        var axesMap = {};
        this.appendAxes(axes, axesMap);
        this.appendRules(axes, axesMap);
        axesMap.xRules.attr("clip-path", "url(#" + this.drawingClipDefinitionId() + ")");
        axesMap.yRules.attr("clip-path", "url(#" + this.yRulesDefinitionId() + ")");
        this.elMap.axes = axesMap;
    };
    Canvas.prototype.totalLegendHeight = function () {
        var computedLegends = this.state.current.get("computed").canvas.legends;
        var topLegends = computedLegends.top;
        var bottomLegend = computedLegends.bottom.left;
        var topLegendsHeight = fp_1.reduce(function (memo, legend) {
            var height = legend.node().offsetHeight;
            return height > memo ? height : memo;
        }, 0)(topLegends);
        return bottomLegend.node().offsetHeight + topLegendsHeight;
    };
    Canvas.prototype.trackMouseMove = function () {
        var _this = this;
        var config = this.state.current.get("config");
        this.el.on("mousemove", function () {
            var event = d3.event;
            var mouse = d3.mouse(_this.el.node());
            _this.mousePosition = {
                absolute: {
                    x: event.pageX,
                    y: event.pageY
                },
                relative: {
                    x: mouse[0] - config.y1.margin || 0,
                    y: mouse[1] - config.x2.margin || 0
                }
            };
            _this.events.emit(event_catalog_1.default.CHART.MOVE, _this.mousePosition);
        });
    };
    Canvas.prototype.stopMouseMove = function () {
        this.el.on("mousemove", undefined);
    };
    Canvas.prototype.drawingDims = function () {
        var drawingContainerDims = this.drawingContainerDims(), axes = this.state.current.get("computed").axes, totalXAxisHeight = fp_1.reduce.convert({ cap: false })(function (memo, axis, key) {
            if (key[0] === "x") {
                memo += axis.dimensions.height;
            }
            return memo;
        }, 0)(axes), totalYAxisWidth = fp_1.reduce.convert({ cap: false })(function (memo, axis, key) {
            if (key[0] === "y") {
                memo += axis.dimensions.width;
            }
            return memo;
        }, 0)(axes), dims = {
            height: drawingContainerDims.height - totalXAxisHeight,
            width: drawingContainerDims.width - totalYAxisWidth,
            rulesHeight: drawingContainerDims.height - totalXAxisHeight / 2,
            rulesWidth: drawingContainerDims.width - totalYAxisWidth / 2,
            xOffset: axes.y1 ? axes.y1.dimensions.width : 0,
            yOffset: axes.x2 ? axes.x2.dimensions.height : 0
        };
        this.stateWriter("drawingDims", dims);
        return dims;
    };
    Canvas.prototype.setClipPathDimensions = function () {
        var drawingContainerDims = this.drawingContainerDims(), drawingDims = this.drawingDims();
        this.elements.defs.select("#" + this.drawingClipDefinitionId() + " rect")
            .attr("width", drawingDims.width)
            .attr("height", drawingDims.height)
            .attr("transform", "translate(" + drawingDims.xOffset + ", " + drawingDims.yOffset + ")");
        this.elements.defs.select("#" + this.yRulesDefinitionId() + " rect")
            .attr("width", drawingDims.rulesWidth)
            .attr("height", drawingDims.height)
            .attr("transform", "translate(" + drawingDims.xOffset / 2 + ", 0)");
        this.elements.defs.select("#" + this.xyRulesDefinitionId() + " rect")
            .attr("width", drawingDims.rulesWidth)
            .attr("height", drawingDims.rulesHeight)
            .attr("transform", "translate(" + drawingDims.xOffset / 2 + ", " + drawingDims.yOffset / 2 + ")");
    };
    return Canvas;
}(drawing_canvas_1.default));
exports.default = Canvas;
//# sourceMappingURL=canvas.js.map