"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var renderer_1 = require("./renderer/renderer");
var fp_1 = require("lodash/fp");
var axisTypeMapper = {
    time: "date",
    realtime: "date",
    quant: "number",
    ordinal: "string"
};
var validators = {
    date: fp_1.isDate,
    number: isFinite,
    object: fp_1.isObject,
    string: function () { return true; }
};
// Simple function to compute a hash from a string
// Use this for caching (checking whether something changed) etc.
function hashString(string) {
    return fp_1.reduce(function (memo, char) {
        memo = ((memo << 5) - memo) + char.charCodeAt(0);
        return memo & memo;
    }, 0)(string.split(""));
}
// hash a JSON stringified object
function hashObject(obj) {
    return hashString(JSON.stringify(obj));
}
var Series = /** @class */ (function () {
    function Series(state, attributes, accessors) {
        this.dataPoints = [];
        this.drawn = false;
        this.state = state;
        this.attributes = fp_1.extend.convert({ immutable: false })({}, attributes);
        this.accessors = accessors;
        this.assignAccessors();
        this.renderers = this.initializeRenderers();
    }
    Series.prototype.assignAccessors = function () {
        var _this = this;
        fp_1.forEach.convert({ cap: false })(function (accessor, key) {
            _this[key] = function () { return accessor(_this.attributes); };
        })(this.accessors);
    };
    Series.prototype.initializeRenderers = function () {
        var _this = this;
        var renderers = this.renderAs();
        return fp_1.reduce(function (memo, renderer) {
            var el = _this.state.current.get("computed").canvas.elements.series[renderer];
            memo.push(new renderer_1.default(_this.state, _this, renderer, el, {}));
            return memo;
        }, [])(renderers);
    };
    // Remove rows with invalid data
    Series.prototype.setData = function (data, total) {
        function selectValidators(dataFormat) {
            return fp_1.map(function (format) {
                if (fp_1.isArray(format)) {
                    return function (subValues) {
                        return fp_1.forEach(function (subValue, i) {
                            return selectValidators(format)[i](subValue);
                        })(subValues);
                    };
                }
                else {
                    return validators[format];
                }
            })(dataFormat);
        }
        var validate = selectValidators(this.dataFormat());
        this.dataPoints = fp_1.filter(function (dataPoint) {
            return fp_1.every.convert({ cap: false })(function (value, i) {
                return i > validate.length - 1 || validate[i](value);
            })(dataPoint);
        })(data);
        this.total = total;
    };
    Series.prototype.hasData = function () {
        return this.data() != null && this.data().length > 0;
    };
    Series.prototype.addMissingDatapoints = function (axis, requiredValues) {
        var currentValues = this.dataForAxis(axis), currentData = this.dataPoints, index = this.dataIndeces()[axis[0]];
        if (currentValues.length === requiredValues.length) {
            return;
        }
        this.dataPoints = fp_1.map(function (val) {
            var datum = [];
            datum[index] = val;
            var current = currentData.find(function (datum) { return datum[index] === val; });
            datum[1 - index] = current ? current[1 - index] : undefined;
            return datum;
        })(requiredValues);
    };
    Series.prototype.seriesAxisType = function (axis) {
        return this.dataFormat()[this.dataIndeces()[axis[0]]];
    };
    Series.prototype.checkCompatible = function (axisName, dataType) {
        var seriesAxisType = this.seriesAxisType(axisName);
        if (seriesAxisType === axisTypeMapper[dataType]) {
            return true;
        }
        throw new Error("Data type " + seriesAxisType + " of series is not compatible with " + axisName + "-axis which requires " + dataType);
    };
    // Update with running index if data is stacked
    Series.prototype.dataForAxis = function (axisName) {
        var _this = this;
        return fp_1.map(function (datum) { return datum[_this.dataIndeces()[axisName[0]]]; })(this.dataPoints);
    };
    Series.prototype.axisMapping = function (axisName) {
        var mapping = this[axisName.match(/x|y/)[0]];
        if (!mapping) {
            return;
        }
        return mapping.axisName === axisName ? mapping : null;
    };
    // focusPoint(axisName: string, focus: any): any {
    //   if (!this.hasData() || this.hasRenderer("event_flag")) { return }
    //   // Look up focus axis information
    //   let focusMapping: any = this.mappings[axisName]
    //   // Find the datapoint for the focused tick
    //   let search: (dp: any) => boolean = function(dataPoint: any): boolean {
    //     return isDate(focus)
    //       ? dataPoint[focusMapping.index].valueOf() === focus.valueOf()
    //       : dataPoint[focusMapping.index] === focus
    //   }
    //   let match: any[] = find(search)(this.dataPoints)
    //   if (!match) { return }
    //   // Get the value for the focused data point for the other axis
    //   let valueMapping: any = this.mappings[this.otherAxis(focusMapping.axis.orientation())]
    //   // Make sure we have an array (makes it compatible with ranges which return a tuple)
    //   let values: any[] = [].concat(match[valueMapping.index])
    //   if (!values.length) { return }
    //   let positionValues: number[] = this.stacked ? [].concat(match[valueMapping.runningIndex]) : values
    //   let positions: any[] = map(valueMapping.axis.computed.scale)(positionValues)
    //   return {
    //     barsOnly: this.hasOnlyRenderer("bars"),
    //     color: this.color,
    //     colorHex: this.colorHex,
    //     formatter: this.displayFormatter(),
    //     name: this.name,
    //     stacked: this.stacked,
    //     total: this.total,
    //     unit: this.unit,
    //     valuePositions: positions,
    //     values: values
    //   }
    // }
    Series.prototype.draw = function () {
        this.drawn ? this.updateDraw() : this.initialDraw();
    };
    Series.prototype.initialDraw = function () {
        this.updateDraw();
        this.drawn = true;
    };
    Series.prototype.updateDraw = function () {
        this.hasData() ? fp_1.forEach(fp_1.invoke("draw"))(this.renderers) : fp_1.forEach(fp_1.invoke("close"))(this.renderers);
    };
    Series.prototype.resize = function () {
        if (this.hasData()) {
            fp_1.invoke("resize")(this.renderAs());
        }
    };
    // Inserts an SVG element into the series group (used by renderers)
    Series.prototype.insertElement = function (name, element) {
        this.el[name].node().appendChild(element.node());
    };
    Series.prototype.close = function () {
        if (this.drawn) {
            fp_1.invoke("close")(this.renderAs());
            fp_1.invoke("remove")(this.el);
            this.drawn = false;
        }
    };
    return Series;
}());
exports.default = Series;
//# sourceMappingURL=series.js.map