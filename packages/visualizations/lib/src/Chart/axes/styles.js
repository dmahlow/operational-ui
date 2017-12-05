"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glamor_1 = require("glamor");
var tickStyle = {
    fontSize: "11px",
    fill: "#9c9c9c",
    "& .weekend": {
        fill: "#9d261d"
    },
    "& .now": {
        fill: "#71a934"
    }
};
var borderStyle = {
    stroke: "#eee",
    strokeWidth: 1,
    shapeRendering: "crispedges",
};
var rectStyle = {
    fill: "#fff"
};
exports.tick = glamor_1.css(tickStyle).toString();
exports.border = glamor_1.css(borderStyle).toString();
exports.rect = glamor_1.css(rectStyle).toString();
//# sourceMappingURL=styles.js.map