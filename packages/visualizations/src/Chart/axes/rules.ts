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
        const computed: IObject = this.state.current.get("computed"),
          axisDimensions: IObject = computed.axes,
          y1Width: number = axisDimensions.y1 && axisDimensions.y1.drawn ? axisDimensions.y1.dimensions.width : 0,
          y2Width: number = axisDimensions.y2 && axisDimensions.y2.drawn ? axisDimensions.y2.dimensions.width : 0
        coordinates.x10 = coordinates.x11 = y1Width / 2
        coordinates.x20 = coordinates.x21 = computed.canvas.drawingContainerDims.width - y2Width / 2
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
