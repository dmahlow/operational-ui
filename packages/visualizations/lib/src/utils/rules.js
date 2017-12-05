"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_ease_1 = require("d3-ease");
var styles = require("./styles");
var Rules = /** @class */ (function () {
    function Rules(state, name, el) {
        this.state = state;
        this.name = name;
        this.el = el;
    }
    Rules.prototype.draw = function (axis) {
        this.drawn ? this.updateDraw(axis) : this.initialDraw(axis);
    };
    Rules.prototype.initialDraw = function (axis) {
        // Root svg element
        // this.el = d3.select(document.createElementNS(d3.ns.prefix["svg"], "g"))
        //   .attr("class", "axis-rules")
        // this.state.canvas.insertElement(this.name + "Rules", this.el)
        this.updateDraw(axis);
        this.drawn = true;
    };
    Rules.prototype.updateDraw = function (axis) {
        var duration = this.state.current.get("config").duration;
        var scale = axis.computed.scale;
        var previousScale = axis.previous.scale;
        var map = axis.tickMapper();
        var data = axis.computed.ticks;
        var coordinates = this.setCoordinates(previousScale, scale, axis);
        // Rule selection
        var ticks = this.el.selectAll("line." + styles.rule)
            .data(data, map);
        ticks.exit().transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
            .attr("x1", coordinates.x11)
            .attr("x2", coordinates.x21)
            .attr("y1", coordinates.y11)
            .attr("y2", coordinates.y21)
            .remove();
        ticks.enter().append("svg:line")
            .attr("x1", coordinates.x10)
            .attr("x2", coordinates.x20)
            .attr("y1", coordinates.y10)
            .attr("y2", coordinates.y20)
            .merge(ticks)
            .attr("class", function (d, i) { return styles.rule + " " + axis.ruleClass(d, i); })
            .transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
            .attr("x1", coordinates.x11)
            .attr("x2", coordinates.x21)
            .attr("y1", coordinates.y11)
            .attr("y2", coordinates.y21);
    };
    Rules.prototype.resize = function (axis) {
        this.updateDraw(axis);
    };
    Rules.prototype.close = function () {
        if (this.drawn) {
            this.el.remove();
            this.drawn = false;
        }
    };
    return Rules;
}());
exports.default = Rules;
//# sourceMappingURL=rules.js.map