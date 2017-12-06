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
    // ["bars", "drawing_clip"],
    // ["bar_line", "drawing_clip"],
    // ["event_flag", "drawing_clip"],
    ["line", "drawing_clip"],
    // ["circles", "drawing_clip"],
    // ["trend", "drawing_clip"],
    // ["points", "drawing_clip"],
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
        _this.appendDrawingClip();
        _this.appendYRulesClip();
        _this.appendBackground();
        _this.appendDrawingGroup();
        var axes = ["y", "x"];
        _this.appendAxes(axes);
        _this.appendRules(axes);
        _this.elements.xRules.attr("clip-path", "url(#" + _this.drawingClipDefinitionId() + ")");
        _this.elements.yRules.attr("clip-path", "url(#" + _this.yRulesDefinitionId() + ")");
        _this.appendSeriesDrawingGroups(seriesElements);
        _this.appendFocus();
        fp_1.forEach(function (options) { return _this.insertLegend(options[0], options[1]); })(legendOptions);
        _this.stateWriter("elements", _this.elements);
        return _this;
    }
    Canvas.prototype.createEl = function () {
        return d3.select(document.createElementNS(d3.namespaces["svg"], "svg"));
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
    return Canvas;
}(drawing_canvas_1.default));
exports.default = Canvas;
//# sourceMappingURL=canvas.js.map