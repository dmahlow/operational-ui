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
var React = require("react");
var glamorous_1 = require("glamorous");
var utils_1 = require("@operational/utils");
var Icon_1 = require("../Icon/Icon");
var Container = glamorous_1.default.div({
    "&:not(:first-child)": {
        borderLeftWidth: 1,
        borderLeftStyle: "solid"
    }
}, function (_a) {
    var theme = _a.theme, color = _a.color, withIcon = _a.withIcon, withActionIcon = _a.withActionIcon;
    var backgroundColor = color ? utils_1.hexOrColor(color)((theme.colors && theme.colors[color]) || "white") : "white";
    return {
        backgroundColor: backgroundColor,
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        width: "fit-content",
        borderColor: theme.colors.gray30,
        padding: theme.spacing / 2,
        paddingLeft: withIcon ? theme.spacing + 20 : theme.spacing / 2,
        paddingRight: withActionIcon ? theme.spacing * 2.25 : theme.spacing / 2,
        color: utils_1.readableTextColor(backgroundColor)(["black", "white"])
    };
});
var Label = glamorous_1.default.small(function (_a) {
    var color = _a.color, theme = _a.theme;
    var backgroundColor = color ? utils_1.hexOrColor(color)((theme.colors && theme.colors[color]) || "white") : "white";
    return __assign({}, theme.typography.small, { marginBottom: 3, fontWeight: 600, color: utils_1.readableTextColor(backgroundColor)([theme.colors.gray60, theme.colors.gray20]) });
});
var IconContainer = glamorous_1.default.div({
    width: 20,
    height: 20,
    cursor: "pointer",
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)"
}, function (_a) {
    var theme = _a.theme, color = _a.color;
    var backgroundColor = color ? utils_1.hexOrColor(color)((theme.colors && theme.colors[color]) || "white") : "white";
    return {
        left: theme.spacing / 2,
        "& svg": {
            stroke: utils_1.readableTextColor(backgroundColor)([theme.colors.white, theme.colors.black])
        }
    };
});
var ActionIconContainer = glamorous_1.default.div(function (_a) {
    var theme = _a.theme, color = _a.color;
    var backgroundColor = color ? utils_1.hexOrColor(color)((theme.colors && theme.colors[color]) || "white") : "white";
    return {
        position: "absolute",
        width: theme.spacing * 1.5,
        height: theme.spacing * 1.5,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        top: 0,
        right: 0,
        "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.25)"
        },
        "& svg": {
            stroke: utils_1.readableTextColor(backgroundColor)([theme.colors.white, theme.colors.black])
        }
    };
});
var InfoTile = function (props) { return (React.createElement(Container, { key: props.id, css: props.css, className: props.className, withIcon: !!props.icon, withActionIcon: !!props.onAction, color: props.color },
    props.icon ? (React.createElement(IconContainer, { color: props.color },
        React.createElement(Icon_1.default, { size: 20, name: props.icon }))) : null,
    props.onAction ? (React.createElement(ActionIconContainer, { color: props.color, onClick: props.onAction },
        React.createElement(Icon_1.default, { name: "MoreHorizontal", size: 8 }))) : null,
    React.createElement(Label, { color: props.color }, props.label),
    React.createElement("span", null, props.children))); };
exports.default = InfoTile;
//# sourceMappingURL=InfoTile.js.map