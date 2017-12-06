"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = require("lodash/fp");
// Focus Label Formatting
var TextLabelFormatter = {
    // Public Functions
    // Used for horizontal text labels (when the y-axis is ordinal/time)
    // Returns a function which takes a datapoint as input and returns an array containing the x-axis offset and
    // text anchor of the label.
    horizontalLabelPosition: function (textAnchorPivot, x, offset, index) {
        return function (d, el) {
            var xPosition = x(d), zeroPosition = x([0, 0]), 
            // If x value is positive
            xValueIsPositive = d[index] > 0, sign = xValueIsPositive ? 1 : -1, totalWidth = offset + el.getBBox().width;
            function withinCanvas(value) {
                return value >= 0 && value <= textAnchorPivot;
            }
            function withinDataPoint(value) {
                return xValueIsPositive ? value >= zeroPosition : value <= zeroPosition;
            }
            var conditions = [
                [withinCanvas(xPosition + sign * totalWidth), "end"],
                [withinDataPoint(xPosition - sign * totalWidth), "inside"],
                [withinCanvas(zeroPosition - sign * totalWidth), "oppositeSideOfAxis"],
                [withinCanvas(zeroPosition + sign * totalWidth), "onAxis"],
                [true, xValueIsPositive ? "end" : "start"] // Default: inside bar
            ];
            var position = fp_1.find(0)(conditions)[1];
            switch (position) {
                case "end":
                    return {
                        dx: sign * offset,
                        textAnchor: xValueIsPositive ? "start" : "end"
                    };
                case "oppositeSideOfAxis":
                    return {
                        dx: zeroPosition - xPosition - sign * offset,
                        textAnchor: xValueIsPositive ? "end" : "start"
                    };
                case "onAxis":
                    return {
                        dx: zeroPosition - xPosition + sign * offset,
                        textAnchor: xValueIsPositive ? "start" : "end"
                    };
                default:
                    return {
                        dx: -sign * offset,
                        textAnchor: xValueIsPositive ? "end" : "start"
                    };
            }
        };
    },
    // Calculate the x offset when the text label is rotated.
    rotatedDx: function (anchor, offset, rotation, center) {
        if (center === void 0) { center = true; }
        return function (d) {
            var bbox = this.getBBox(), angle = (-rotation) * Math.PI / 180, textWidth = center ? bbox.width : 0, textHeight = center ? bbox.height : 0, rotatedTextWidth = textWidth * Math.cos(angle) + textHeight * Math.sin(angle), centeringOffset = rotatedTextWidth / 2 - textHeight * Math.sin(angle), xOffset = (offset - centeringOffset) * Math.cos(angle), textAnchor = anchor.bind(this);
            return textAnchor(d) === "start" ? xOffset : -xOffset;
        };
    },
    // Calculate the y offset when the text label is rotated.
    rotatedDy: function (anchor, offset, rotation, center) {
        if (center === void 0) { center = true; }
        return function (d) {
            var bbox = this.getBBox(), angle = (90 + rotation) * Math.PI / 180, textWidth = center ? bbox.width : 0, textHeight = center ? bbox.height : 0, rotatedTextWidth = textWidth * Math.cos(angle) + textHeight * Math.sin(angle), centeringOffset = rotatedTextWidth / 2 - textHeight * Math.sin(angle), yOffset = (offset + centeringOffset) * Math.sin(angle), textAnchor = anchor.bind(this);
            return textAnchor(d) === "start" ? -yOffset : yOffset + bbox.height / 2;
        };
    },
    // Used for rotated text labels (when the x-axis is ordinal/time)
    rotatedTextAnchor: function (textAnchorPivot, y, offset, index, rotation) {
        return function (d) {
            var angle = Math.abs(rotation) * Math.PI / 180, bbox = this.getBBox(), yOffset = offset + bbox.width * Math.sin(angle) + bbox.height * Math.cos(angle);
            // If y value is positive
            return d[index] > 0
                ? (y(d) - yOffset > 0 ? "start" : "end")
                : (y(d) + yOffset < textAnchorPivot ? "end" : "start");
        };
    }
};
exports.default = TextLabelFormatter;
//# sourceMappingURL=textlabel_formatter.js.map