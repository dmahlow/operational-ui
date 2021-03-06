"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var SelectOption_1 = require("./SelectOption");
var SelectFilter_1 = require("./SelectFilter");
var Select_style_1 = require("./Select.style");
var with_label_1 = require("../utils/with-label");
var displayOption = function (opt) {
    if (opt.label) {
        return opt.label;
    }
    return String(opt.value);
};
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            open: false,
            updating: false,
            filter: new RegExp(/./)
        };
        return _this;
    }
    // This implements "click outside to close" behavior
    Select.prototype.handleClick = function (ev) {
        // if we're clicking on the Select itself,
        if (this.containerNode && this.containerNode.contains(ev.target)) {
            return;
        }
        // if we're clicking outside,
        this.close();
    };
    Select.prototype.handleEsc = function (e) {
        if (e.keyCode === 27) {
            this.close();
        }
    };
    Select.prototype.componentDidMount = function () {
        document.addEventListener("click", this.handleClick.bind(this), true);
        document.addEventListener("keyup", this.handleEsc.bind(this), true);
    };
    Select.prototype.componentWillUnmount = function () {
        document.removeEventListener("click", this.handleClick.bind(this), true);
        document.removeEventListener("keyup", this.handleEsc.bind(this), true);
    };
    Select.prototype.getDisplayValue = function () {
        var _this = this;
        var placeholder = this.props.placeholder || "No entries selected";
        if (!this.props.value) {
            return placeholder;
        }
        if (!Array.isArray(this.props.value)) {
            var displayedOption = this.props.options.filter(function (option) { return option.value === _this.props.value; })[0];
            return displayedOption ? displayOption(displayedOption) : placeholder;
        }
        var listDisplay = this.props.options
            .map(function (option) { return (_this.props.value.indexOf(option.value) > -1 ? displayOption(option) : null); })
            .filter(function (a) { return !!a; })
            .join(", ");
        return listDisplay === "" ? this.props.placeholder || "No entries selected" : listDisplay;
    };
    Select.prototype.selectOption = function (option) {
        if (!Array.isArray(this.props.value)) {
            this.props.onChange(this.props.value === option.value ? null : option.value);
            return;
        }
        var optionIndex = this.props.value.indexOf(option.value);
        if (optionIndex < 0) {
            this.props.onChange(this.props.value.concat([option.value]), option.value);
        }
        else {
            this.props.onChange(this.props.value.slice(0, optionIndex).concat(this.props.value.slice(optionIndex + 1)), option.value);
        }
    };
    Select.prototype.isOptionSelected = function (option) {
        if (!Array.isArray(this.props.value)) {
            return this.props.value === option.value;
        }
        return this.props.value.indexOf(option.value) > -1;
    };
    Select.prototype.updateFilter = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event.persist();
                        if (!(event.target instanceof HTMLInputElement)) {
                            throw new Error("<Select>: Your filter field is _not_ an input element and therefore has an unreadable value.");
                        }
                        if (!this.props.onFilter) return [3 /*break*/, 2];
                        this.setState(function () { return ({ updating: true }); });
                        return [4 /*yield*/, this.props.onFilter()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        filter = new RegExp(event.target.value, "i");
                        this.setState(function () { return ({ filter: filter, updating: false }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Select.prototype.toggle = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!this.state.open && this.props.onClick)) return [3 /*break*/, 2];
                        this.setState(function () { return ({ updating: true }); });
                        return [4 /*yield*/, this.props.onClick()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.setState(function (prevState) { return ({ updating: false, open: !prevState.open }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Select.prototype.close = function () {
        this.setState(function () { return ({
            open: false
        }); });
    };
    Select.prototype.render = function () {
        var _this = this;
        return (React.createElement(Select_style_1.Container, { id: this.props.domId, key: this.props.id, innerRef: function (containerNode) { return (_this.containerNode = containerNode); }, css: this.props.css, className: this.props.className, updating: this.state.updating, color: this.props.color, disabled: this.props.disabled, role: "listbox", tabIndex: -2, onClick: function () { return _this.toggle(); } },
            React.createElement(Select_style_1.DisplayValue, { isPlaceholder: Array.isArray(this.props.value) ? this.props.value.length === 0 : !this.props.value }, this.getDisplayValue()),
            this.props.options.length && this.state.open ? (React.createElement(Select_style_1.Options, null,
                this.props.filterable && React.createElement(SelectFilter_1.default, { onChange: function (e) { return _this.updateFilter(e); } }),
                React.createElement(Select_style_1.OptionsList, null, this.props.options.map(function (option) {
                    return option.label.match(_this.state.filter) && (React.createElement(SelectOption_1.default, { key: String(option.value), onClick: function () { return _this.selectOption(option); }, selected: _this.isOptionSelected(option) }, option.label));
                })))) : ("")));
    };
    return Select;
}(React.Component));
exports.default = with_label_1.default(Select);
//# sourceMappingURL=Select.js.map