"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("d3-transition");
var d3_ease_1 = require("d3-ease");
var d3_scale_1 = require("d3-scale");
var d3_array_1 = require("d3-array");
var d3_utils_1 = require("../../utils/d3_utils");
var fp_1 = require("lodash/fp");
var styles = require("./styles");
var sideMapping = {
    "x2": "top",
    "x1": "bottom",
    "y1": "left",
    "y2": "right"
};
var AbstractAxis = /** @class */ (function () {
    function AbstractAxis(state, stateWriter, name, options, elGroup) {
        if (options === void 0) { options = {}; }
        // Initially nothing has been computed (this becomes previous in first compute call)
        this.computed = {};
        this.drawn = false;
        this.hasSpaceForFlags = false;
        this.state = state;
        this.stateWriter = stateWriter;
        this.name = name;
        this.type = options.type;
        this.elGroup = elGroup;
        this.updateOptions(options);
    }
    AbstractAxis.prototype.updateOptions = function (options) {
        return;
    };
    AbstractAxis.prototype.compute = function (args) {
        this.previous = this.computed;
        var computed = {};
        // if (this.discrete) {
        //   let barSeries: any[] = this.prepareBarSeries()
        //   computed.numberOfBars = barSeries.length
        //   computed.tickOffsetRequired = this.state.series.tickOffsetRequired()
        // }
        computed.range = this.computeRange();
        computed.rangeDirection = this.computeRangeDirection(computed.range);
        computed.width = this.computeWidth(computed.range);
        this.computeAxisInformation(computed, args);
        this.computed = computed;
        this.previous = fp_1.defaults(this.computed)(this.previous);
        this.stateWriter(["computed"], this.computed);
    };
    AbstractAxis.prototype.data = function () {
        return this.state.current.get("computed").series.computed[this.name].data;
    };
    AbstractAxis.prototype.series = function () {
        return this.state.current.get("computed").series.computed[this.name].series;
    };
    AbstractAxis.prototype.hasFlags = function () {
        return this.state.current.get("computed").series.computed[this.name].hasFlags;
    };
    AbstractAxis.prototype.orientation = function () {
        return this.name.match(/x|y/)[0];
    };
    AbstractAxis.prototype.tickClass = function (tickValue, index) {
        return "";
    };
    AbstractAxis.prototype.ruleClass = function (ruleValue, index) {
        return "";
    };
    AbstractAxis.prototype.axisPosition = function () {
        var drawingContainerDims = this.state.current.get("computed").canvas.drawingContainerDims, axisDims = this.axisDimensions();
        switch (this.name) {
            case "x1":
                return [0, drawingContainerDims.height - axisDims.height];
            case "x2":
                return [0, axisDims.height];
            case "y1":
                return [axisDims.width, 0];
            case "y2":
                return [drawingContainerDims.width - axisDims.width, 0];
            default:
                return;
        }
    };
    AbstractAxis.prototype.axisDimensions = function () {
        return this.el.node().getBoundingClientRect();
    };
    // Drawing
    AbstractAxis.prototype.draw = function () {
        // Only render the axis if it has data.
        this.data().length > 0
            ? (this.drawn ? this.updateDraw() : this.initialDraw())
            : this.close();
        this.stateWriter(["dimensions"], this.axisDimensions());
    };
    AbstractAxis.prototype.initialDraw = function () {
        // svg element
        this.el = this.elGroup.append("svg:g")
            .attr("class", "axis " + this.type + "-axis " + this.name);
        // .attr("transform", "translate(" + this.axisPosition().join(",") + ")")
        // Background rect for component hover
        this.el.append("svg:rect")
            .attr("class", styles.rect);
        // Border
        this.el.append("svg:line")
            .attr("class", styles.border)
            .call(d3_utils_1.setLineAttributes, { x1: 0, x2: 0, y1: 0, y2: 0 });
        this.updateDraw();
        this.drawn = true;
    };
    AbstractAxis.prototype.border = function () {
        var range = this.computeRange(), isXAxis = this.orientation() === "x";
        return {
            x1: isXAxis ? range[0] : 0,
            x2: isXAxis ? range[1] : 0,
            y1: isXAxis ? 0 : range[0],
            y2: isXAxis ? 0 : range[1] - this.state.current.get("config").y1.minTopOffsetTopTick
        };
    };
    AbstractAxis.prototype.updateDraw = function () {
        var _this = this;
        // Short
        var config = this.state.current.get("config"), duration = config.duration, tickOffset = config[this.name].tickOffset, drawingContainerDims = this.state.current.get("computed").canvas.drawingContainerDims, attributes = this.getAttributes(), startAttributes = this.getStartAttributes(attributes);
        // Tick selection
        var ticks = this.el.selectAll("text." + styles.tick)
            .data(this.computed.ticks, this.tickMapper());
        ticks.enter().append("svg:text")
            .attr("class", function (d, i) {
            return styles.tick + "  " + _this.tickClass(d, i);
        })
            .call(d3_utils_1.setTextAttributes, startAttributes)
            .merge(ticks)
            .attr("class", function (d, i) {
            return styles.tick + "  " + _this.tickClass(d, i);
        })
            .call(d3_utils_1.setTextAttributes, attributes, duration);
        ticks.exit()
            .transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
            .call(d3_utils_1.setTextAttributes, fp_1.defaults(attributes)({ opacity: 1e6 }))
            .remove();
        // Axis position
        this.el.transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
            .attr("transform", "translate(" + this.axisPosition().join(",") + ")");
        this.el.select("line." + styles.border)
            .call(d3_utils_1.setLineAttributes, this.border(), duration);
    };
    AbstractAxis.prototype.getAttributes = function () {
        var config = this.state.current.get("config"), scale = this.computed.scale, data = this.computed.ticks, tickOffset = config[this.name].tickOffset, isXAxis = this.orientation() === "x", unitTick = isXAxis ? data[0] : fp_1.last(data), format = this.tickFormatter(unitTick);
        return {
            dx: isXAxis ? 0 : tickOffset,
            dy: isXAxis ? tickOffset : (this.hasRules() ? -4 : 4),
            labelText: format,
            textAnchor: isXAxis ? "middle" : (this.name === "y1" ? "end" : "start"),
            x: isXAxis ? scale : 0,
            y: isXAxis ? 0 : scale
        };
    };
    AbstractAxis.prototype.getStartAttributes = function (attributes) {
        var previousScale = this.previous.scale;
        var x0 = attributes.x === 0 ? 0 : previousScale;
        var y0 = attributes.y === 0 ? 0 : previousScale;
        return fp_1.defaults(attributes)({ x: x0, y: y0 });
    };
    AbstractAxis.prototype.computeRange = function () {
        var otherAxesDims = this.state.current.get("computed").axes, drawingContainerDims = this.state.current.get("computed").canvas.drawingContainerDims, x1Height = otherAxesDims.x1 && otherAxesDims.x1.dimensions ? otherAxesDims.x1.dimensions.height : 0, x2Height = otherAxesDims.x2 && otherAxesDims.x2.dimensions ? otherAxesDims.x2.dimensions.height : 0, y1Width = otherAxesDims.y1 && otherAxesDims.y1.dimensions ? otherAxesDims.y1.dimensions.width : 0, y2Width = otherAxesDims.y2 && otherAxesDims.y2.dimensions ? otherAxesDims.y2.dimensions.width : 0;
        return this.orientation() === "x"
            ? [y1Width, drawingContainerDims.width - y2Width]
            : [drawingContainerDims.height - x1Height, x2Height + this.state.current.get("config").y1.minTopOffsetTopTick];
    };
    AbstractAxis.prototype.computeAdjustedRange = function (width) {
        return this.orientation() === "x" ? [0, width] : [width, 0];
    };
    AbstractAxis.prototype.computeRangeDirection = function (range) {
        return range[0] < range[1] ? "up" : "down";
    };
    AbstractAxis.prototype.computeWidth = function (range) {
        return Math.abs(range[0] - range[1]);
    };
    AbstractAxis.prototype.computeBarOffset = function (tickWidth, numberOfBars) {
        var innerPadding = 0;
        var outerPadding = numberOfBars > 1 ? 0.1 : 0;
        return d3_scale_1.scaleBand()
            .domain(fp_1.map(String)(d3_array_1.range(numberOfBars)))
            .range([0, tickWidth])
            .paddingInner(innerPadding)
            .paddingOuter(outerPadding);
    };
    AbstractAxis.prototype.adjustRange = function () {
        this.compute();
        this.draw();
    };
    AbstractAxis.prototype.close = function () {
        if (this.drawn) {
            this.el.remove();
            this.drawn = false;
        }
    };
    return AbstractAxis;
}());
exports.default = AbstractAxis;
//# sourceMappingURL=abstract_axis.js.map