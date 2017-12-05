"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glamor_1 = require("glamor");
var legendStyle = {
    fontSize: "11px",
    position: "relative",
    overflow: "hidden"
};
var legendTopBottomStyle = {
    padding: "0 7px",
    margin: "3px 0",
    "& .series-legend, .comparison-legend": {
        float: "left"
    }
};
var seriesLegendStyle = {
    padding: "1px 3px 0 3px",
    lineHeight: "14px",
    "& div.color": {
        width: "6px",
        height: "6px",
        margin: "2px 3px 0 0",
        float: "left",
    },
    "& div.name": {
        float: "left"
    }
};
var drawingContainerStyle = {
    position: "relative",
    overflow: "hidden"
};
var chartBackgroundStyle = {
    fill: "#fff"
};
var ruleStyle = {
    stroke: "#eee",
    strokeWidth: "1px",
    shapeRendering: "crispedges",
    "& .zero": {
        strokeWidth: "2px",
    },
    "& .now": {
        stroke: "#71a934",
        strokeDasharray: "2, 4"
    }
};
exports.legend = glamor_1.css(legendStyle).toString();
exports.legendTopBottom = glamor_1.css(legendTopBottomStyle).toString();
exports.seriesLegend = glamor_1.css(seriesLegendStyle).toString();
exports.drawingContainer = glamor_1.css(drawingContainerStyle).toString();
exports.chartBackground = glamor_1.css(chartBackgroundStyle).toString();
exports.rule = glamor_1.css(ruleStyle).toString();
//# sourceMappingURL=styles.js.map