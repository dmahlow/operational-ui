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
exports.line = glamor_1.css(lineStyle).toString();
exports.textlabels = glamor_1.css(textlabelStyle).toString();
//# sourceMappingURL=styles.js.map