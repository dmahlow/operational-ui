"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var d3_ease_1 = require("d3-ease");
exports.withD3Element = function (func) {
    return function (datum) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return func.apply(void 0, [datum, this].concat(args));
    };
};
function transitionOrSelection(selection, duration) {
    return duration != null
        ? selection.transition()
            .duration(duration)
            .ease(d3_ease_1.easeLinear)
        : selection;
}
exports.setLineAttributes = function (selection, attributes, duration) {
    transitionOrSelection(selection, duration)
        .style("stroke", attributes.color)
        .attr("x1", attributes.x1)
        .attr("x2", attributes.x2)
        .attr("y1", attributes.y1)
        .attr("y2", attributes.y2);
};
exports.setTextAttributes = function (selection, attributes, duration) {
    transitionOrSelection(selection, duration)
        .attr("x", attributes.x)
        .attr("y", attributes.y)
        .attr("dx", attributes.dx)
        .attr("dy", attributes.dy)
        .style("text-anchor", attributes.textAnchor)
        .attr("transform", attributes.transform)
        .text(attributes.labelText)
        .style("opacity", attributes.opacity || 1);
};
exports.setPathAttributes = function (selection, attributes, duration) {
    // If 'color' is provided, it is used for both fill and stroke, unless these are explicitly set.
    transitionOrSelection(selection, duration)
        .attr("d", attributes.path)
        .style("fill", attributes.fill || attributes.color)
        .style("stroke", attributes.stroke || attributes.color)
        .style("opacity", attributes.opacity);
};
exports.setRectAttributes = function (selection, attributes, duration) {
    transitionOrSelection(selection, duration)
        .attr("x", attributes.x)
        .attr("y", attributes.y)
        .attr("width", attributes.width)
        .attr("height", attributes.height)
        .style("fill", attributes.color)
        .style("stroke", attributes.stroke);
};
//# sourceMappingURL=d3_utils.js.map