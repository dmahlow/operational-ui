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
var glamorous_1 = require("glamorous");
var inputHeight = 31;
var Container = glamorous_1.default.div(function (_a) {
    var isExpanded = _a.isExpanded, theme = _a.theme;
    return ({
        display: "inline-block",
        width: "auto",
        position: "relative",
        "& .co_card": {
            display: isExpanded ? "block" : "none",
            position: "absolute",
            boxShadow: theme.shadows.popup,
            top: inputHeight + 4,
            left: 0,
            padding: theme.spacing * 3 / 4 + "px " + theme.spacing + "px " + theme.spacing * 4 / 3 + "px",
            width: 210 + 2 * theme.spacing,
            zIndex: theme.baseZIndex + 1000
        }
    });
});
exports.Container = Container;
var Toggle = glamorous_1.default.div(function (_a) {
    var theme = _a.theme;
    return ({
        position: "absolute",
        bottom: 0,
        cursor: "pointer",
        right: 0,
        width: inputHeight,
        height: inputHeight,
        fontSize: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: theme.baseZIndex + 1,
        color: theme.colors.gray80,
        borderLeft: "1px solid " + theme.colors.gray40
    });
});
exports.Toggle = Toggle;
var MonthNav = glamorous_1.default.div(function (_a) {
    var theme = _a.theme;
    return ({
        marginBottom: theme.spacing / 2,
        textAlign: "center",
        "& > *": {
            margin: "0 6px",
            verticalAlign: "middle",
            display: "inline-block"
        },
        "& > span": __assign({}, theme.typography.body, { userSelect: "none", width: 100, textAlign: "center" })
    });
});
exports.MonthNav = MonthNav;
var IconContainer = glamorous_1.default.div({
    backgroundColor: "#FFFFFF",
    padding: 4,
    height: "auto",
    width: "fit-content",
    cursor: "pointer"
});
exports.IconContainer = IconContainer;
var Days = glamorous_1.default.div({
    textAlign: "center",
    width: 210,
    margin: "auto -1px"
});
exports.Days = Days;
var Day = glamorous_1.default.div({
    userSelect: "none",
    width: 30,
    height: 30,
    marginRight: -1,
    marginBottom: -1,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #efefef"
}, function (_a) {
    var theme = _a.theme, selected = _a.selected, isPlaceholder = _a.isPlaceholder;
    return (__assign({}, theme.typography.body, { backgroundColor: selected ? theme.colors.success : "transparent", color: selected ? "#FFF" : isPlaceholder ? theme.colors.gray80 : theme.colors.black }));
});
exports.Day = Day;
var Input = glamorous_1.default.input(function (_a) {
    var theme = _a.theme;
    return (__assign({}, theme.typography.body, { userSelect: "none", borderRadius: 2, padding: theme.spacing * 2 / 3, height: inputHeight, cursor: "pointer", border: "1px solid", borderColor: theme.colors.gray30, width: 200, position: "relative", "&:focus": {
            outline: 0,
            borderColor: "rgba(82,168,236,.8)",
            boxShadow: theme.shadows.focus
        } }));
});
exports.Input = Input;
var ClearButton = glamorous_1.default.div(function (_a) {
    var theme = _a.theme;
    return ({
        width: inputHeight,
        height: inputHeight,
        cursor: "pointer",
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bottom: 0,
        right: -inputHeight + 1,
        opacity: 0.3,
        textAlign: "center",
        zIndex: theme.baseZIndex + 100,
        "&:hover": {
            opacity: 1,
            "& svg": {
                stroke: theme.colors.warning
            }
        }
    });
});
exports.ClearButton = ClearButton;
//# sourceMappingURL=DatePicker.styles.js.map