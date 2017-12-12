"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import Area from "./area"
// import BarLine from "./bar_line"
var bars_1 = require("./bars");
// import EventFlag from "./event_flag"
var line_1 = require("./line");
// import Points from "./points"
// import Range from "./range"
var textlabels_1 = require("./textlabels");
// Factory Class
var Renderer = /** @class */ (function () {
    function Renderer(state, series, type, el, options) {
        switch (type) {
            // case "area":
            //   return new Area(state, series, options)
            // case "bar_line":
            //   return new BarLine(state, series, options)
            case "bars":
                return new bars_1.default(state, series, el, options);
            // case "event_flag":
            //   return new EventFlag(state, series, options)
            case "line":
                return new line_1.default(state, series, el, options);
            // case "points":
            //   return new Points(state, series, options)
            // case "range":
            //   return new Range(state, series, options)
            case "textlabels":
                return new textlabels_1.default(state, series, el, options);
            default:
                throw new Error("invalid render type '" + type + "' specified");
        }
    }
    return Renderer;
}());
exports.default = Renderer;
//# sourceMappingURL=renderer.js.map