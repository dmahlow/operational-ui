"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("@operational/utils");
var getTooltipPosition = function (anchor) {
    var position = {};
    switch (anchor) {
        case "bottom":
            position.bottom = 0;
            break;
        default:
            position.top = "50%";
            position.transform = "translateY(-50%)";
            break;
    }
    return position;
};
var getCaretPosition = function (anchor) { return function (theme) {
    var size = 5, caret = { left: size * -2, borderWidth: size };
    switch (anchor) {
        case "bottom":
            caret.bottom = theme.spacing;
            break;
        case "middle":
        default:
            caret.top = "50%";
            caret.transform = "translateY(-50%)";
            break;
    }
    return caret;
}; };
exports.default = function (_a) {
    var theme = _a.theme, color = _a.color, anchor = _a.anchor;
    var backgroundColor = color ? utils_1.hexOrColor(color)(theme.colors[color]) : "black";
    return __assign({ backgroundColor: backgroundColor, position: "absolute" }, getTooltipPosition(anchor), { left: "calc(100% + " + theme.spacing + "px)", zIndex: theme.baseZIndex + 101, width: "fit-content", maxWidth: 200, opacity: 0, transition: ".07s opacity ease", padding: theme.spacing / 2, borderRadius: 4, wordWrap: "break-word", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)", color: utils_1.readableTextColor(backgroundColor)(["black", "white"]), 
        // This pseudo-element extends the clickable area of the far-away tooltip.
        "&::after": {
            content: "''",
            position: "absolute",
            top: 0,
            left: theme.spacing * -2,
            display: "block",
            width: theme.spacing * 2,
            height: "100%"
        }, 
        // They say behind every great tooltip is a great caret.
        "&::before": __assign({ content: "''", position: "absolute" }, getCaretPosition(anchor || "top")(theme), { zIndex: theme.baseZIndex - 1, width: 0, height: 0, borderColor: "transparent", borderStyle: "solid", borderRightColor: backgroundColor }), "&.active": {
            opacity: 1
        } });
};
//# sourceMappingURL=Tooltip.style.js.map