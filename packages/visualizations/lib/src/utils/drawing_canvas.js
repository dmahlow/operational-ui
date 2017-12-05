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
var canvas_1 = require("./canvas");
var d3 = require("d3-selection");
require("d3-transition");
var d3_ease_1 = require("d3-ease");
var fp_1 = require("lodash/fp");
var styles = require("./styles");
var DrawingCanvas = /** @class */ (function (_super) {
    __extends(DrawingCanvas, _super);
    function DrawingCanvas(state, stateWriter, events, context) {
        var _this = _super.call(this, state, stateWriter, events, context) || this;
        _this.elements = {};
        _this.legendMap = {};
        _this.elements.defs = _this.el.append("defs");
        return _this;
    }
    DrawingCanvas.prototype.insertEl = function () {
        var el = this.createEl();
        this.drawingContainer = this.insertDrawingContainer();
        this.drawingContainer.node().appendChild(el.node());
        this.elMap.series = el;
        return el;
    };
    DrawingCanvas.prototype.insertDrawingContainer = function () {
        var drawingContainer = d3.select(document.createElementNS(d3.namespaces["xhtml"], "div"))
            .attr("class", styles.drawingContainer);
        this.container.node().appendChild(drawingContainer.node());
        return drawingContainer;
    };
    DrawingCanvas.prototype.mouseOverElement = function () {
        return this.container;
    };
    DrawingCanvas.prototype.prefixedId = function (id) {
        return this.state.current.get("config").uid + id;
    };
    DrawingCanvas.prototype.appendDrawingGroup = function () {
        this.elements.drawing = this.el.append("svg:g").attr("class", "drawing");
    };
    DrawingCanvas.prototype.appendDrawingClip = function () {
        this.elements.defs.append("clipPath")
            .attr("class", "chart-clip-path")
            .attr("id", this.prefixedId("_xrules_group"))
            .append("rect");
    };
    DrawingCanvas.prototype.appendYRulesClip = function () {
        this.elements.defs.append("clipPath")
            .attr("class", "chart-clip-path")
            .attr("id", this.prefixedId("_yrules_clip"))
            .append("rect");
    };
    DrawingCanvas.prototype.appendBackground = function () {
        this.elements.background = this.el.append("rect").attr("class", styles.chartBackground).attr("x", 0).attr("y", 0);
    };
    DrawingCanvas.prototype.appendRules = function (axes) {
        var _this = this;
        fp_1.forEach(function (axis) {
            _this.elements[axis + "Rules"] = _this.elements.drawing.append("svg:g").attr("class", axis + "-rules-group");
        })(axes);
    };
    DrawingCanvas.prototype.appendAxes = function (axes) {
        var _this = this;
        fp_1.forEach(function (axis) {
            _this.elements[axis + "Axes"] = _this.elements.drawing.append("svg:g").attr("class", axis + "-axes-group");
        })(axes);
    };
    DrawingCanvas.prototype.appendSeriesDrawingGroups = function (seriesElements) {
        var _this = this;
        var series = this.elements.drawing.append("svg:g").attr("class", "series-drawings-group");
        this.elements.series = fp_1.reduce(function (memo, se) {
            if (fp_1.isArray(se)) {
                var renderer = se[0];
                var clip = se[1];
                memo[renderer] = series.append("svg:g")
                    .attr("class", "series-" + renderer)
                    .attr("clip-path", "url(#" + _this.prefixedId("clip") + ")");
            }
            else {
                memo[se] = series.append("svg:g").attr("class", "series-" + se);
            }
            return memo;
        }, {})(seriesElements);
    };
    DrawingCanvas.prototype.appendFocus = function () {
        this.elements.focus = this.elements.drawing.append("svg:g").attr("class", "focus-group");
    };
    DrawingCanvas.prototype.insertLegend = function (position, float) {
        var legendPositionClass = ["top", "bottom"].indexOf(position) > -1 ? styles.legendTopBottom : "";
        var legend = d3.select(document.createElementNS(d3.namespaces["xhtml"], "div"))
            .attr("class", styles.legend + " " + legendPositionClass + " " + float)
            .style("float", float);
        position === "bottom" ? this.insertLegendAfter(legend) : this.insertLegendBefore(legend);
        // @TODO why is this line necessary??
        this.legendMap = this.legendMap || {};
        this.legendMap[position] = this.legendMap[position] || {};
        this.legendMap[position][float] = legend;
        this.stateWriter("legends", this.legendMap);
    };
    DrawingCanvas.prototype.insertLegendBefore = function (element) {
        var ref = this.drawingContainer.node();
        ref.parentNode.insertBefore(element.node(), ref);
    };
    DrawingCanvas.prototype.insertLegendAfter = function (element) {
        var ref = this.drawingContainer.node();
        ref.parentNode.insertBefore(element.node(), ref.nextSibling);
    };
    DrawingCanvas.prototype.drawingContainerDims = function () {
        var config = this.state.current.get("config"), legendHeight = this.totalLegendHeight(), dims = {
            height: config.height - legendHeight,
            width: config.width
        };
        this.stateWriter("drawingContainerDims", dims);
        return dims;
    };
    DrawingCanvas.prototype.totalLegendHeight = function () {
        var legend = this.state.current.get("computed").legend;
        return legend && (legend.position === "top" || legend.position === "bottom") ? legend.dimensions().height + 1 : 0;
    };
    DrawingCanvas.prototype.drawingClipDefinitionId = function () {
        return this.prefixedId("_drawing_clip");
    };
    DrawingCanvas.prototype.yRulesDefinitionId = function () {
        return this.prefixedId("_yrules_clip");
    };
    DrawingCanvas.prototype.shadowDefinitionId = function () {
        return this.prefixedId("_shadow");
    };
    DrawingCanvas.prototype.draw = function () {
        _super.prototype.draw.call(this);
        var config = this.state.current.get("config");
        var drawingContainerDims = this.drawingContainerDims();
        this.container
            .style("width", config.width + "px")
            .style("height", config.height + "px");
        this.drawingContainer
            .style("width", drawingContainerDims.width + "px")
            .style("height", drawingContainerDims.height + "px");
        this.el
            .style("width", drawingContainerDims.width + "px")
            .style("height", drawingContainerDims.height + "px");
        this.elements.background.transition()
            .duration(config.duration).ease(d3_ease_1.easeLinear)
            .attr("width", drawingContainerDims.width)
            .attr("height", drawingContainerDims.height);
        this.elements.defs.select("#" + this.drawingClipDefinitionId() + " rect").transition()
            .duration(config.duration).ease(d3_ease_1.easeLinear)
            .attr("width", config.width)
            .attr("height", config.height + 1);
        this.elements.defs.select("#" + this.yRulesDefinitionId() + " rect").transition()
            .duration(config.duration).ease(d3_ease_1.easeLinear)
            .attr("width", drawingContainerDims.width)
            .attr("height", config.height);
        // .attr("transform", "translate(" + (config.y1.margin) + ", 0)")
        this.elements.drawing.transition()
            .duration(config.duration).ease(d3_ease_1.easeLinear);
        // .attr("transform", "translate(" + (config.y1.margin + "," + config.x2.margin) + ")")
    };
    DrawingCanvas.prototype.resize = function () {
        this.draw();
    };
    DrawingCanvas.prototype.remove = function () {
        _super.prototype.remove.call(this);
        this.elements = {};
        if (!this.drawingContainer) {
            return;
        }
        this.drawingContainer.remove();
        this.drawingContainer = undefined;
    };
    return DrawingCanvas;
}(canvas_1.default));
exports.default = DrawingCanvas;
//# sourceMappingURL=drawing_canvas.js.map