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
Object.defineProperty(exports, "__esModule", { value: true });
var legend_1 = require("../utils/legend");
var Legend = /** @class */ (function (_super) {
    __extends(Legend, _super);
    function Legend() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Legend.prototype.data = function () {
        return this.state.current.get("computed").series.dataForLegend[this.position][this.float];
    };
    Legend.prototype.dataKey = function (d) {
        return d.key;
    };
    Legend.prototype.colorAccessor = function (d) {
        return d.color;
    };
    Legend.prototype.labelAccessor = function (d) {
        return d.name;
    };
    return Legend;
}(legend_1.default));
exports.default = Legend;
//# sourceMappingURL=legend.js.map