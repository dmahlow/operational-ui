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
exports.line = glamor_1.css(lineStyle).toString();
//# sourceMappingURL=styles.js.map