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
var rules_1 = require("../../utils/rules");
var Rules = /** @class */ (function (_super) {
    __extends(Rules, _super);
    function Rules() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rules.prototype.setCoordinates = function (previousScale, scale) {
        var coordinates = {};
        // Axis specific
        switch (this.name) {
            case "x":
                coordinates.x10 = coordinates.x20 = previousScale;
                coordinates.x11 = coordinates.x21 = scale;
                coordinates.y10 = coordinates.y11 = 0;
                coordinates.y20 = coordinates.y21 = this.state.current.get("computed").canvas.drawingHeight;
                break;
            case "y":
                // Extend rules outside of the drawing area
                var computed = this.state.current.get("computed"), axisDimensions = computed.axes, y1Width = axisDimensions.y1 && axisDimensions.y1.drawn ? axisDimensions.y1.dimensions.width : 0, y2Width = axisDimensions.y2 && axisDimensions.y2.drawn ? axisDimensions.y2.dimensions.width : 0;
                coordinates.x10 = coordinates.x11 = y1Width / 2;
                coordinates.x20 = coordinates.x21 = computed.canvas.drawingContainerDims.width - y2Width / 2;
                coordinates.y10 = coordinates.y20 = previousScale;
                coordinates.y11 = coordinates.y21 = scale;
                break;
            default:
                break;
        }
        return coordinates;
    };
    return Rules;
}(rules_1.default));
exports.default = Rules;
//# sourceMappingURL=rules.js.map