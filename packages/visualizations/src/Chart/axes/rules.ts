import AbstractRules from "../../utils/rules"
import { IObject } from "../typings"

class Rules extends AbstractRules {

  setCoordinates(previousScale: any, scale: any): any {
    let coordinates: any = {}

    // Axis specific
    switch (this.name) {
      case "x":
        coordinates.x10 = coordinates.x20 = previousScale
        coordinates.x11 = coordinates.x21 = scale
        coordinates.y10 = coordinates.y11 = 0
        coordinates.y20 = coordinates.y21 = this.state.current.get("computed").canvas.drawingHeight
        break
      case "y":
        // Extend rules outside of the drawing area
        const axisDimensions: IObject = this.state.current.get("computed").axes
        coordinates.x10 = coordinates.x11 = axisDimensions.y1.dimensions.width / 2
        coordinates.x20 = coordinates.x21 = this.state.current.get("computed").canvas.drawingContainerDims.width + axisDimensions.y2.dimensions.width / 2
        coordinates.y10 = coordinates.y20 = previousScale
        coordinates.y11 = coordinates.y21 = scale
        break
      default:
        break
    }
    return coordinates
  }
}

export default Rules
