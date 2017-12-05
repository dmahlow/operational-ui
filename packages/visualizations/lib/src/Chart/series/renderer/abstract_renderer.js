"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_ease_1 = require("d3-ease");
require("d3-transition");
var fp_1 = require("lodash/fp");
var styles = require("./styles");
var AbstractRenderer = /** @class */ (function () {
    function AbstractRenderer(state, series, el, options) {
        if (options === void 0) { options = {}; }
        this.drawn = false;
        this.state = state;
        this.series = series;
        this.el = this.appendSeriesEl(el);
        this.options = options;
        this.initialize();
    }
    AbstractRenderer.prototype.appendSeriesEl = function (el) {
        return el.append("g")
            .attr("class", "series")
            .attr("data-sid", this.series.key);
    };
    AbstractRenderer.prototype.initialize = function () {
        return;
    };
    // yIsBaseline(): boolean {
    //   return this.baseline.axis === this.y.axis
    // }
    // We need to get d3 element from context, can't bind onClick to this
    AbstractRenderer.prototype.onClick = function (ctx) {
        return function (d, i) {
            // @TODO
            // ctx.state.trigger("select:element", ctx.series, d)
        };
    };
    AbstractRenderer.prototype.onMouseOver = function (ctx) {
        return;
    };
    // Return function that can be plugged into d3
    AbstractRenderer.prototype.axisScale = function (scale, index) {
        return function (d) { return scale(d[index]); };
    };
    AbstractRenderer.prototype.draw = function () {
        var _this = this;
        // Make mapping available in a comfortable way:
        var computedAxes = this.state.current.get("computed").axes;
        fp_1.forEach.convert({ cap: false })(function (axis, key) {
            if (axis.computed.baseline) {
                _this.baseline = axis;
                _this.baseline.axis = key;
            }
        })(computedAxes);
        this.x = computedAxes[this.series.xAxis()].computed;
        this.y = computedAxes[this.series.yAxis()].computed;
        // this.prepareDraw()
        if (this.drawn) {
            this.updateDraw();
        }
        else {
            this.appendGroup();
            this.initialDraw();
        }
    };
    // prepareDraw(): void {
    //   if (!this.baseline) {
    //     throw new Error(this.type + " renderer needs at least one axis with baseline (quant axis)")
    //   }
    // }
    AbstractRenderer.prototype.appendGroup = function () {
        // svg element
        this.el.append("svg:g")
            .attr("class", styles[this.type]);
    };
    AbstractRenderer.prototype.drawingScales = function () {
        var computedAxes = this.state.current.get("computed").axes;
        var x = this.axisScale(this.x.scale, this.series.dataIndeces().x);
        var y = this.axisScale(this.y.scale, this.series.dataIndeces().y);
        var baseline = this.baseline.computed.baseline;
        return [x, y, baseline];
    };
    AbstractRenderer.prototype.enterSelection = function (data, attributes) {
        this.el
            .select("g." + styles[this.type])
            .selectAll(this.accessor)
            .data(data, this.key)
            .enter()
            .append("svg:" + this.accessor)
            .call(this.setAttributes, attributes, this)
            .on("click", this.onClick(this))
            .on("mouseenter", this.onMouseOver(this));
    };
    AbstractRenderer.prototype.transitionSelection = function (data, attributes, duration, onTransitionEnd) {
        if (onTransitionEnd === void 0) { onTransitionEnd = undefined; }
        this.el
            .select("g." + styles[this.type])
            .selectAll(this.accessor)
            .data(data, this.key)
            .call(this.setAttributes, attributes, this, duration, onTransitionEnd);
        // .each("end", onTransitionEnd)
    };
    AbstractRenderer.prototype.exitSelection = function (data, attributes, duration) {
        this.el.selectAll(this.accessor)
            .data(data, this.key)
            .exit()
            .call(this.setAttributes, attributes, this, duration)
            .remove();
    };
    AbstractRenderer.prototype.updateSelection = function (previousAttributes, currentAttributes, data, duration) {
        this.el.selectAll(this.accessor)
            .data(data, this.key)
            .call(this.setAttributes, previousAttributes, this);
        if (this.accessor === "path") {
            this.transitionSelection(data, currentAttributes, duration);
        }
        else {
            this.exitSelection(data, currentAttributes, duration);
            this.enterSelection(data, previousAttributes);
            this.transitionSelection(data, currentAttributes, duration);
        }
    };
    AbstractRenderer.prototype.initialDraw = function (redraw) {
        if (redraw === void 0) { redraw = false; }
        var _a = this.drawingScales(), x = _a[0], y = _a[1], baseline = _a[2];
        var config = this.state.current.get("config");
        // only half the duration available if second part of a redraw
        var duration = config.duration;
        if (redraw) {
            duration *= config.durationRedraw;
        }
        var data = this.data(x, y);
        var currentDraw = this.getAttributes(x, y, baseline);
        var startAttributes = this.getStartAttributes(x, y, baseline, currentDraw);
        this.enterSelection(data, startAttributes);
        this.transitionSelection(data, currentDraw, duration);
        this.previousDraw = currentDraw;
        this.drawn = true;
    };
    AbstractRenderer.prototype.updateDraw = function () {
        // Can't transition to new data - redraw
        (!this.x.axis.computed.transition || !this.y.axis.computed.transition) ? this.reDraw() : this.transitionDraw();
    };
    // collapse drawing to old baseline, then draw it from scratch
    AbstractRenderer.prototype.reDraw = function () {
        var _this = this;
        var _a = this.drawingScales(), x = _a[0], y = _a[1], baseline = _a[2];
        var config = this.state.current.get("config");
        // only half the time available as we need to do the initial draw again
        var duration = config.duration * config.durationCollapse;
        var collapseAttributes = this.getCollapseAttributes(x, y, baseline);
        // As we are animating more than one element, and the 'end' event is fired for each one,
        // we have to make sure that our callback to redraw is only run once
        var done = false;
        this.el.selectAll(this.accessor)
            .transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
            .call(this.setAttributes, collapseAttributes, this)
            .each("end", function () {
            if (done) {
                return;
            }
            done = true;
            _this.close();
            _this.appendGroup();
            _this.initialDraw(true);
        });
    };
    AbstractRenderer.prototype.transitionDraw = function () {
        var _a = this.drawingScales(), x = _a[0], y = _a[1], baseline = _a[2];
        var duration = this.state.current.get("config").duration;
        var data = this.data(x, y);
        var currentDraw = this.getAttributes(x, y, baseline);
        this.updateSelection(this.previousDraw, currentDraw, data, duration);
        this.previousDraw = currentDraw;
    };
    AbstractRenderer.prototype.close = function () {
        if (this.drawn) {
            this.el.remove();
            this.drawn = false;
        }
    };
    return AbstractRenderer;
}());
exports.default = AbstractRenderer;
//# sourceMappingURL=abstract_renderer.js.map