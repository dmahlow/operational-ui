"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var legend_1 = require("./legend");
var fp_1 = require("lodash/fp");
var LegendManager = /** @class */ (function () {
    function LegendManager(state, stateWriter, events, el) {
        this.legends = [];
        this.state = state;
        this.stateWriter = stateWriter;
        this.events = events;
        this.el = el;
        this.legends = this.initializeLegends();
    }
    LegendManager.prototype.initializeLegends = function () {
        var _this = this;
        var legends = [];
        fp_1.forEach.convert({ cap: false })(function (floats, position) {
            fp_1.forEach.convert({ cap: false })(function (el, float) {
                legends.push(new legend_1.default(_this.state, position, float, el));
            })(floats);
        })(this.state.current.get("computed").canvas.legends);
        return legends;
    };
    LegendManager.prototype.draw = function () {
        fp_1.forEach(function (legend) {
            legend.draw();
        })(this.legends);
        this.arrangeTopLegends();
    };
    LegendManager.prototype.topLegends = function () {
        return [this.get("top", "left"), this.get("top", "right")];
    };
    LegendManager.prototype.get = function (position, float) {
        return fp_1.find({ float: float, position: position })(this.legends);
    };
    // If there are 2 top legends (left & right), ensure they make sensible use of the available space.
    LegendManager.prototype.arrangeTopLegends = function () {
        var left = this.get("top", "left"), right = this.get("top", "right");
        if (!right.drawn) {
            return;
        }
        var width = this.state.current.get("config").width, leftNode = left.legend.node(), rightNode = right.legend.node(), leftWidth = left.dimensions().width, rightWidth = right.dimensions().width;
        if (leftWidth + rightWidth <= width) {
            return;
        }
        //
        if (leftWidth < width / 2) {
            right.legend.style("width", width - leftWidth - (rightWidth - rightNode.width()));
        }
        else if (rightWidth < width / 2) {
            left.legend.style("width", width - rightWidth - (leftWidth - leftNode.width()));
        }
        else {
            // Give the legend which takes up more space as much as possible
            var leftIsLonger = leftWidth > rightWidth, longer = leftIsLonger ? left : right, shorter = leftIsLonger ? right : left, longerNode = leftIsLonger ? leftNode : rightNode, shorterNode = leftIsLonger ? rightNode : leftNode, longerString_1 = leftIsLonger ? "left" : "right", shorterString = leftIsLonger ? "right" : "left";
            shorter.legend.style("width", (this.state.current.get("config").width / 2) - (shorterNode.outerWidth(true) - shorterNode.width()) + "px");
            var seriesLegends = shorter.legend.selectAll(".series-legend");
            var xOffset_1 = this.el.node().getBoundingClientRect()[shorterString] +
                parseInt(shorter.legend.style("padding-" + shorterString), 10);
            var width_1 = fp_1.reduce(function (memo, legend) {
                return Math.max(memo, Math.abs(legend.getBoundingClientRect()[longerString_1] - xOffset_1));
            }, 0)(seriesLegends[0]);
            shorter.legend.style("width", Math.ceil(width_1) + "px");
            var horizontalPadding = longerNode.outerWidth(true) - longerNode.width();
            longer.legend.style("width", width_1 - shorterNode.outerWidth(true) - horizontalPadding + "px");
        }
    };
    LegendManager.prototype.resize = function () {
        fp_1.invoke("resize")(this.legends);
    };
    return LegendManager;
}());
exports.default = LegendManager;
//# sourceMappingURL=legend_manager.js.map