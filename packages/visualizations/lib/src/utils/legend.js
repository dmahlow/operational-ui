"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = require("lodash/fp");
var d3 = require("d3-selection");
var $ = require("jquery");
var d3_utils_1 = require("./d3_utils");
var styles = require("./styles");
function roundedUpWidth(el) { return Math.ceil(el.getBoundingClientRect().width); }
function roundedUpHeight(el) { return Math.ceil(el.getBoundingClientRect().height); }
function widthMargin(el) {
    if (!el) {
        return 0;
    }
    var style = window.getComputedStyle(el);
    return parseFloat(style.marginLeft) + parseFloat(style.marginRight);
}
function widthPadding(el) {
    if (!el) {
        return 0;
    }
    var style = window.getComputedStyle(el);
    return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
}
function heightMargin(el) {
    if (!el) {
        return 0;
    }
    var style = window.getComputedStyle(el);
    return parseFloat(style.marginTop) + parseFloat(style.marginBottom);
}
function totalWidth(element) {
    if (!element) {
        return 0;
    }
    var style = window.getComputedStyle(element), padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight), border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    return roundedUpWidth(element) + widthMargin(element) - widthPadding(element) + border;
}
function totalHeight(element) {
    if (!element) {
        return 0;
    }
    var style = window.getComputedStyle(element), padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom), border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    return roundedUpHeight(element) + heightMargin(element) - padding + border;
}
// Basic discrete color legend.
var Legend = /** @class */ (function () {
    function Legend(state, position, float, el) {
        this.drawn = false;
        this.state = state;
        this.position = position;
        this.float = float;
        this.legend = el;
    }
    Legend.prototype.draw = function () {
        var _this = this;
        var computedSeries = this.state.current.get("computed").series;
        // No legend
        if (!this.state.current.get("config").legend || computedSeries && !computedSeries.hasData) {
            this.remove();
        }
        else if (this.drawn) {
            // Check if legend requirements are the same as before. If they are, call updateDraw(),
            // otherwise remove legend and draw from scratch.
            var sameReqs = fp_1.every.convert({ cap: false })(function (req, i) {
                return _this.previousRequirements[i] === req;
            })(this.requirements());
            if (sameReqs) {
                this.updateDraw();
            }
            else {
                this.remove();
                this.initialDraw();
            }
        }
        else {
            this.initialDraw();
        }
        this.previousRequirements = this.requirements();
    };
    Legend.prototype.requirements = function () {
        return [this.state.current.get("config").legend, this.position, this.float];
    };
    Legend.prototype.initialDraw = function () {
        this.appendLegendElements();
        this.updateDraw();
    };
    // Only required if legend has multiple components, i.e. in bubble charts, the legend can
    // consist of both a color legend and a size legend.
    Legend.prototype.appendLegendElements = function () {
        return;
    };
    Legend.prototype.updateDraw = function () {
        var _this = this;
        this.setFixedLegendDimensions();
        var legends = this.legend.selectAll("div." + styles.seriesLegend)
            .data(this.data(), this.dataKey);
        legends.exit().remove();
        legends
            .enter()
            .append("div")
            .attr("class", styles.seriesLegend)
            .style("float", this.float)
            .each(d3_utils_1.withD3Element(function (d, el) {
            var element = d3.select(el);
            element
                .append("div")
                .attr("class", "color");
            element
                .append("div")
                .attr("class", "name");
        }))
            .merge(legends)
            .each(d3_utils_1.withD3Element(function (d, el) {
            var element = d3.select(el);
            element.select("div.color")
                .style("background-color", _this.colorAccessor);
            element.select("div.name")
                .html(_this.labelAccessor);
        }));
        this.updateComparisonLegend();
        this.drawn = this.data().length > 0;
        this.updateDimensions();
    };
    // Currently only used for gauges.
    Legend.prototype.updateComparisonLegend = function () {
        return;
    };
    Legend.prototype.setFixedLegendDimensions = function () {
        // remove fixed width before drawing
        this.legend.style("width", null);
        this.legend.style("height", null);
        var $legend;
        var verticalPadding;
        var horizontalPadding;
        // if (this.legend) {
        //   $legend = $(this.legend.node())
        //   verticalPadding = $legend.outerHeight(true) - $legend.height()
        //   horizontalPadding = $legend.outerWidth(true) - $legend.width()
        // }
        if (this.position === "right") {
            this.legend.style("width", "");
            // $legend.find(".name").css("width", "")
            this.legend.style("height", this.state.current.get("config").height + "px");
        }
        else if (["top", "bottom"].indexOf(this.position) >= 0) {
            this.legend.style("width", "");
            this.legend.style("height", "");
            // $legend.find(".name").css("height", "")
        }
    };
    // onComponentHover(ctx: any): (d: any) => void {
    //   return function(d: any): void {
    //     ctx.state.trigger(Events.FOCUS.COMPONENT.HOVER, d3.select(this), ctx.currentOptions(d))
    //     d3.select(this).on("mouseleave", function(): void { ctx.state.trigger(Events.FOCUS.COMPONENT.OUT) })
    //   }
    // }
    // abstract currentOptions(datum: any): any
    Legend.prototype.dimensions = function () {
        var legendNode = this.legend.node();
        return {
            height: this.legend ? totalHeight(legendNode) - heightMargin(legendNode) : 0,
            width: this.legend ? totalWidth(legendNode) - widthMargin(legendNode) : 0
        };
    };
    Legend.prototype.updateDimensions = function () {
        var legendNode = this.legend.node(), config = this.state.current.get("config"), colorBoxWidth = totalWidth(this.legend.select(".color").node()), seriesLegendPadding = widthPadding(this.legend.selectAll("." + styles.seriesLegend).node());
        if (this.position === "right") {
            var w = this.state.current.get("config").width;
            var lw = roundedUpWidth(legendNode) + widthMargin(legendNode);
            // Legend is wider than legend ratio
            if (lw / w > config.maxLegendRatio) {
                lw = w * config.maxLegendRatio;
            }
            // Legend is wider than legend max
            if (lw > config.maxLegendWidth) {
                lw = config.maxLegendWidth;
            }
            // Chart is smaller than chart min
            if (w - lw < config.minChartWithLegend) {
                lw = w - config.minChartWithLegend;
            }
            // Legend is too small to display
            if (lw < config.minLegendWidth) {
                this.remove();
            }
            else {
                // If legend width has changed, width of legend text div needs to decrease as well.
                if (lw !== roundedUpWidth(legendNode) + widthMargin(legendNode)) {
                    this.legend.attr("width", lw - widthMargin(legendNode));
                    var newNameWidth_1 = roundedUpWidth(legendNode) - seriesLegendPadding - colorBoxWidth;
                    // If any of the .name divs are wider than the max possible name width and only have
                    // one word (i.e. won't be split onto 2 lines), remove the legend.
                    fp_1.some(function (name) {
                        return name.innerHTML.split(" ").length === 1 && $(name).width() > newNameWidth_1;
                    })(this.legend.selectAll(".name").node())
                        ? this.remove()
                        : this.legend.selectAll(".name").attr("width", newNameWidth_1);
                }
                if (totalHeight(legendNode) > this.state.height) {
                    this.remove();
                }
            }
        }
        else {
            var h = config.height;
            var lh = roundedUpHeight(legendNode) + heightMargin(legendNode);
            // Legend is higher than legend ratio or chart is smaller than chart min
            if (lh / h > config.maxLegendRatio || h - lh < config.minChartWithLegend) {
                this.remove();
            }
            else {
                if (totalWidth(legendNode) > this.state.width) {
                    this.remove();
                }
            }
        }
    };
    Legend.prototype.remove = function () {
        if (this.legend) {
            this.legend.node().innerHTML = "";
            this.legend = null;
            this.drawn = false;
        }
    };
    return Legend;
}());
exports.default = Legend;
//# sourceMappingURL=legend.js.map