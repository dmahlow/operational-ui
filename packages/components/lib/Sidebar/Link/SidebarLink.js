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
var react_router_dom_1 = require("react-router-dom");
var glamorous_1 = require("glamorous");
var utils_1 = require("@operational/utils");
var style = function (_a) {
    var theme = _a.theme, color = _a.color, disabled = _a.disabled, active = _a.active;
    var backgroundColor = color ? utils_1.hexOrColor(color)(theme.colors && theme.colors[color]) : "#fff";
    var textColor = active ? theme.colors.linkText : utils_1.readableTextColor(backgroundColor)([theme.colors.gray80, "white"]);
    var disabledStyle = disabled ? { opacity: 0.25 } : { opacity: 1 };
    return __assign({ backgroundColor: backgroundColor }, theme.typography.body, { fontWeight: active ? 600 : 400, position: "relative", display: "flex", padding: theme.spacing / 3 + "px " + theme.spacing + "px", cursor: "pointer", 
        // react-router <Link /> wraps an <a> which can be underlined by default so
        textDecoration: "none", color: textColor }, disabledStyle, { "&:link, &:visited": {
            color: textColor
        }, ":focus": {
            outline: 0
        }, "&.co_link + .co_link": {
            borderTop: "1px solid",
            borderColor: theme.colors.secondarySeparator
        }, ":hover": {
            backgroundColor: utils_1.darken(backgroundColor)(2),
            // The text color needs to change too if it gets too dark 😁
            // Also, here's a prime benefit of functional JS: function composition!
            color: active ? textColor : utils_1.readableTextColor(utils_1.darken(backgroundColor)(5))(["black", "white"])
        } });
};
exports.style = style;
var Symbol = glamorous_1.default.div({
    marginLeft: "auto"
});
var SidebarLink = function (_a) {
    var id = _a.id, style = _a.style, className = _a.className, children = _a.children, to = _a.to, onClick = _a.onClick, symbol = _a.symbol;
    // if this is expected to work with react-router,
    if (to) {
        return (React.createElement(react_router_dom_1.Link, { to: to ? to : "", style: style, key: id, className: className + " co_link" },
            children,
            symbol ? React.createElement(Symbol, null, symbol) : ""));
    }
    return (React.createElement("div", { key: id, style: style, onClick: onClick, className: className + " co_link" },
        children,
        symbol ? React.createElement(Symbol, null, symbol) : ""));
};
exports.SidebarLink = SidebarLink;
exports.default = glamorous_1.default(SidebarLink)(style);
//# sourceMappingURL=SidebarLink.js.map