"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axis_1 = require("./axes/axis");
var rules_1 = require("./axes/rules");
var fp_1 = require("lodash/fp");
var validAxes = ["x1", "x2", "y1", "y2"];
var AxesManager = /** @class */ (function () {
    function AxesManager(state, stateWriter, events) {
        this.axes = [];
        this.oldAxes = [];
        this.rules = {};
        this.state = state;
        this.stateWriter = stateWriter;
        this.events = events;
    }
    AxesManager.prototype.checkValidity = function (name) {
        if (validAxes.indexOf(name) === -1) {
            throw new Error("invalid axis name '" + name + "' - valid names " + validAxes.join(" or "));
        }
    };
    AxesManager.prototype.compute = function () {
        var _this = this;
        this.oldAxes = this.axes;
        this.axes = [];
        var axesData = this.state.current.get("accessors").data.axes(this.state.current.get("data")), elements = this.state.current.get("computed").canvas.elements;
        fp_1.forEach.convert({ cap: false })(function (axisData, key) {
            _this.checkValidity(key);
            var existingAxisIndex = fp_1.findIndex({ name: key, type: axisData.type })(_this.oldAxes);
            _this.axes.push(existingAxisIndex > -1 ? _this.oldAxes[existingAxisIndex] : new axis_1.default(_this.state, key, axisData, elements[key[0] + "Axes"]));
            if (existingAxisIndex > -1) {
                _this.oldAxes.splice(existingAxisIndex, 1);
            }
        })(axesData);
        fp_1.forEach(fp_1.invoke("close"))(this.oldAxes);
        this.eachXY(function (axes) {
            // only if both axes are used by series do they need to be aligned
            var requiredAxes = _this.state.current.get("computed").series.requiredAxes, computeAxes = fp_1.filter(function (axis) {
                return requiredAxes.indexOf(axis.name) > -1;
            })(axes);
            if (computeAxes.length === 2) {
                _this.align(computeAxes);
            }
            else {
                fp_1.forEach(fp_1.invoke("compute"))(axes);
            }
        });
    };
    AxesManager.prototype.draw = function () {
        var _this = this;
        this.compute();
        this.eachXY(function (axes) {
            // only if both axes are used by series do they need to be aligned
            var requiredAxes = _this.state.current.get("computed").series.requiredAxes, computeAxes = fp_1.filter(function (axis) {
                return requiredAxes.indexOf(axis.name) > -1;
            })(axes);
            if (computeAxes.length === 2) {
                _this.align(computeAxes);
            }
            else {
                fp_1.forEach(function (axis) {
                    axis.compute();
                })(axes);
            }
            fp_1.forEach(function (axis) {
                axis.draw();
                _this.stateWriter([axis.name], { dimensions: axis.axisDimensions() });
            })(axes);
        });
        this.adjustMargins();
        this.drawRules();
    };
    // The x-axes need to be moved to ensure the y-axes have enough space
    AxesManager.prototype.adjustMargins = function () {
        fp_1.forEach(fp_1.invoke("adjustRange"))(this.axesForOrientation("x"));
    };
    AxesManager.prototype.drawRules = function () {
        var _this = this;
        this.eachXY(function (axes, orientation) {
            // Draw / Update rules
            var axisWithRules = fp_1.find(function (axis) { return axis.hasRules(); })(axes);
            if (axisWithRules) {
                var rules = _this.rules[orientation];
                if (!rules) {
                    var element = _this.state.current.get("computed").canvas.elements[orientation + "Rules"];
                    rules = _this.rules[orientation] = new rules_1.default(_this.state, orientation, element);
                }
                rules.draw(axisWithRules);
            }
            else {
                // Remove Rules
                if (_this.rules[orientation]) {
                    _this.rules[orientation].close();
                }
                delete _this.rules[orientation];
            }
        });
    };
    AxesManager.prototype.eachXY = function (func) {
        var _this = this;
        fp_1.forEach(function (orientation) {
            func.call(_this, _this.axesForOrientation(orientation), orientation);
        })(["x", "y"]);
    };
    AxesManager.prototype.axesForOrientation = function (orientation) {
        return fp_1.filter(function (axis) {
            return axis.orientation() === orientation;
        })(this.axes);
    };
    AxesManager.prototype.align = function (axes) {
        axes[0].align(axes[1]);
    };
    return AxesManager;
}());
exports.default = AxesManager;
//# sourceMappingURL=axes_manager.js.map