"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import TimeAxis from "./time_axis"
var quant_axis_1 = require("./quant_axis");
var ordinal_axis_1 = require("./ordinal_axis");
var fp_1 = require("lodash/fp");
var config = [
    // [TimeAxis, "time", "date"],
    [quant_axis_1.default, "quant", "number"],
    [ordinal_axis_1.default, "ordinal", "string"],
];
// Factory Class
var Axis = /** @class */ (function () {
    function Axis(state, stateWriter, name, options, elGroup) {
        if (options === void 0) { options = {}; }
        var type = fp_1.find({ 1: options.type })(config);
        if (!type) {
            throw new Error("invalid axis type " + options.type + " specified");
        }
        var axis = new type[0](state, stateWriter, name, options, elGroup);
        return axis;
    }
    return Axis;
}());
exports.default = Axis;
//# sourceMappingURL=axis.js.map