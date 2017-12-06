import { find } from "lodash/fp"

// Focus Label Formatting
const TextLabelFormatter: any = {
  // Public Functions

  // Used for horizontal text labels (when the y-axis is ordinal/time)
  // Returns a function which takes a datapoint as input and returns an array containing the x-axis offset and
  // text anchor of the label.
  horizontalLabelPosition: function(textAnchorPivot: number, x: any, offset: number, index: number): any {
    return (d: any[], el: any): { textAnchor: string, dx: number } => {
      const xPosition: number = x(d),
        zeroPosition: number = x([0, 0]),
      // If x value is positive
        xValueIsPositive: boolean = d[index] > 0,
        sign: number = xValueIsPositive ? 1 : -1,
        totalWidth: number = offset + el.getBBox().width

      function withinCanvas(value: number): boolean {
        return value >= 0 && value <= textAnchorPivot
      }
      function withinDataPoint(value: number): boolean {
        return xValueIsPositive ? value >= zeroPosition : value <= zeroPosition
      }

      const conditions: [boolean, string][] = [
        [withinCanvas(xPosition + sign * totalWidth), "end"], // The text label can sit outside datapoint (bar etc.)
        [withinDataPoint(xPosition - sign * totalWidth), "inside"], // ... inside datapoint
        [withinCanvas(zeroPosition - sign * totalWidth), "oppositeSideOfAxis"], // ... opposite side of y-axis
        [withinCanvas(zeroPosition + sign * totalWidth), "onAxis"], // ... on the y-axis
        [true, xValueIsPositive ? "end" : "start"] // Default: inside bar
      ]

      const position: string = find(0)(conditions)[1]

      switch (position) {
        case "end":
          return {
            dx: sign * offset,
            textAnchor: xValueIsPositive ? "start" : "end"
          }
        case "oppositeSideOfAxis":
          return {
            dx: zeroPosition - xPosition - sign * offset,
            textAnchor: xValueIsPositive ? "end" : "start"
          }
        case "onAxis":
          return {
            dx: zeroPosition - xPosition + sign * offset,
            textAnchor: xValueIsPositive ? "start" : "end"
          }
        default:
          return {
            dx: -sign * offset,
            textAnchor: xValueIsPositive ? "end" : "start"
          }
      }
    }
  },

  // Calculate the x offset when the text label is rotated.
  rotatedDx: function(anchor: any, offset: number, rotation: number, center: boolean = true): (d: any) => number {
    return function(d: any): number {
      const bbox: ClientRect = this.getBBox(),
        angle: number = (-rotation) * Math.PI / 180,
        textWidth: number = center ? bbox.width : 0,
        textHeight: number = center ? bbox.height : 0,
        rotatedTextWidth: number = textWidth * Math.cos(angle) + textHeight * Math.sin(angle),
        centeringOffset: number = rotatedTextWidth / 2 - textHeight * Math.sin(angle),
        xOffset: number = (offset - centeringOffset) * Math.cos(angle),
        textAnchor: any = anchor.bind(this)
      return textAnchor(d) === "start" ? xOffset : -xOffset
    }
  },

  // Calculate the y offset when the text label is rotated.
  rotatedDy: function(anchor: any, offset: number, rotation: number, center: boolean = true): (d: any) => number {
    return function(d: any): number {
      const bbox: ClientRect = this.getBBox(),
        angle: number = (90 + rotation) * Math.PI / 180,
        textWidth: number = center ? bbox.width : 0,
        textHeight: number = center ? bbox.height : 0,
        rotatedTextWidth: number = textWidth * Math.cos(angle) + textHeight * Math.sin(angle),
        centeringOffset: number = rotatedTextWidth / 2 - textHeight * Math.sin(angle),
        yOffset: number = (offset + centeringOffset) * Math.sin(angle),
        textAnchor: any = anchor.bind(this)
      return textAnchor(d) === "start" ? -yOffset : yOffset + bbox.height / 2
    }
  },

  // Used for rotated text labels (when the x-axis is ordinal/time)
  rotatedTextAnchor: function(textAnchorPivot: number, y: any, offset: number, index: number, rotation: number): any {
    return function(d: any): string {
      const angle: number = Math.abs(rotation) * Math.PI / 180,
        bbox: any = this.getBBox(),
        yOffset: number = offset + bbox.width * Math.sin(angle) + bbox.height * Math.cos(angle)
      // If y value is positive
      return d[index] > 0
        ? (y(d) - yOffset > 0 ? "start" : "end")
        : (y(d) + yOffset < textAnchorPivot ? "end" : "start")
    }
  }

}

export default TextLabelFormatter
