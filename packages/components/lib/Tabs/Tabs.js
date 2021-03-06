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
var Tab_1 = require("./Tab");
exports.Tab = Tab_1.default;
var Container = glamorous_1.default.div({});
var Content = glamorous_1.default.div({
    marginTop: 18
});
var TabList = glamorous_1.default.ul({
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    position: "relative",
    border: "none",
    "&:after": {
        position: "absolute",
        display: "block",
        content: " ",
        width: "100%",
        height: 1,
        left: 0,
        bottom: 0,
        background: "red",
        zIndex: 1
    },
    "> *:not(:last-child)": {
        marginRight: 20
    }
}, function (_a) {
    var theme = _a.theme;
    return ({
        "&:after": {
            background: utils_1.darken(theme.colors.gray20)(6)
        }
    });
});
var TabPanel = glamorous_1.default.div({});
var overflowEllipsis = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    wordWrap: "normal"
};
var TabTitle = glamorous_1.default.li({
    cursor: "pointer",
    flex: "0 0 auto",
    listStyle: "none",
    maxWidth: "100%",
    position: "relative",
    padding: "5px 15px",
    zIndex: 10
}, function (_a) {
    var theme = _a.theme, color = _a.color, isActive = _a.isActive, disabled = _a.disabled;
    return (__assign({}, theme.typography.body, overflowEllipsis, { borderBottom: "2px solid transparent" }, isActive
        ? {
            color: color,
            borderColor: color
        }
        : {}, disabled
        ? {
            color: theme.colors.gray60,
            cursor: "not-allowed"
        }
        : {
            "&:hover": {
                color: color
            }
        }));
});
var Tabs = function (_a) {
    var _b = _a.active, active = _b === void 0 ? 0 : _b, _c = _a.activeColor, activeColor = _c === void 0 ? "info" : _c, children = _a.children, _d = _a.onChange, onChange = _d === void 0 ? function () { } : _d, theme = _a.theme;
    // Get all children properties and add an index value to each of them
    var childrenProps = React.Children.map(children, function (child, index) { return (__assign({}, child.props, { index: index })); });
    var color = utils_1.hexOrColor(activeColor)(theme.colors[activeColor] || theme.colors.info);
    // Display only the active panel based off the children props
    var _e = childrenProps.find(function (_a) {
        var index = _a.index;
        return index === active;
    }), panelContent = _e.children, disabled = _e.disabled;
    var activePanel = disabled ? null : React.createElement(TabPanel, null, panelContent);
    // Build titles fragment based off the children props
    var tabTitles = childrenProps.map(function (_a) {
        var disabled = _a.disabled, index = _a.index, title = _a.title;
        return (React.createElement(TabTitle, { color: color, disabled: disabled, isActive: active === index && !disabled, key: index, onClick: function () {
                if (!disabled)
                    onChange(index);
            } }, title));
    });
    return (React.createElement(Container, null,
        React.createElement(TabList, null, tabTitles),
        React.createElement(Content, null, activePanel)));
};
var WrappedTabs = glamorous_1.withTheme(Tabs);
exports.Tabs = WrappedTabs;
//# sourceMappingURL=Tabs.js.map