"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var glamorous_1 = require("glamorous");
var Icon_1 = require("../Icon/Icon");
var size = 60;
var Container = glamorous_1.default.div({
    width: "100%"
});
var Content = glamorous_1.default.div(function (_a) {
    var theme = _a.theme, isActive = _a.isActive, isExpanded = _a.isExpanded;
    return ({
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
        height: size,
        flex: "0 0 " + size + "px",
        color: isActive ? theme.colors.linkText : theme.colors.white,
        backgroundColor: isExpanded ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0)"
    });
});
var Label = glamorous_1.default.div({
    width: "fit-content",
    whiteSpace: "nowrap"
});
var IconContainer = glamorous_1.default.div({
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 " + size + "px"
});
var SidenavHeader = function (props) { return (React.createElement(Container, { key: props.id, css: props.css, className: props.className },
    React.createElement(Content, { isActive: !!props.active, isExpanded: !!props.expanded },
        React.createElement(IconContainer, null, props.icon === String(props.icon) ? React.createElement(Icon_1.default, { name: props.icon, size: 24 }) : props.icon),
        React.createElement(Label, null, props.label)),
    props.expanded ? props.children : null)); };
exports.default = SidenavHeader;
//# sourceMappingURL=SidenavHeader.js.map