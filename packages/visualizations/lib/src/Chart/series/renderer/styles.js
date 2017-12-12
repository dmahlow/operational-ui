"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glamor_1 = require("glamor");
var lineStyle = {
    "& path": {
        strokeWidth: "2px",
        fill: "none",
        "&.hover": {
            strokeWidth: "4px",
        },
    },
    "& path.dashed": {
        strokeDasharray: "6, 4"
    }
};
var textlabelStyle = {
    "& text": {
        fontSize: "10px",
        fill: "#333"
    }
};
var barsStyle = {
    "& rect": {
        opacity: "0.8",
        fill: "none",
        shapeRendering: "crispedges",
        "&.hover": {
            opacity: "1"
        }
    }
};
exports.line = glamor_1.css(lineStyle).toString();
exports.textlabels = glamor_1.css(textlabelStyle).toString();
exports.bars = glamor_1.css(barsStyle).toString();
//# sourceMappingURL=styles.js.map