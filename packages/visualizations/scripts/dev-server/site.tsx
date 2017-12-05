import * as React from "react"
import { render } from "react-dom"
import Chart from "../../src/Chart/facade"
import VisualizationWrapper from "../../src/utils/VisualizationWrapper"

class Site extends React.Component<{}, {}> {
  state = {
    data: {
      series: [
        {
          key: "666569643:pageviews",
          name: "Pageviews",
          data: [
            ["A", 15300],
            ["B", 17200],
            ["C", 18600],
            ["D", 20500],
            ["E", 20770],
            ["F", "test"],
            ["G", 22900],
            ["H", 22100],
            ["I", 23500],
            [23200, "J"]
          ],
          dataFormat: ["string", "number"],
          render: ["bars"],
          color: "#00f",
        },
        {
          key: "666569644:clicks",
          name: "Sales",
          data: [
            ["A", 215300],
            ["B", 317200],
            ["C", 118600],
            ["D", 220500],
            ["E", 120770],
            ["G", 222900],
            ["H", 122100],
            ["I", 323500]
          ],
          dataFormat: ["string", "number"],
          render: ["bars"],
          color: "#0f0",
          yAxis: "y2"
        }
      ],
      axes: {
        x1: {
          type: "ordinal"
        },
        y1: {
          type: "quant",
          unit: "",
          formatter: (d: number): string => d.toLocaleString(),
        },
        y2: {
          type: "quant",
          unit: "EUR",
          formatter: (d: number): string => d.toLocaleString(),
        }
      }
    }
  }

  render() {
    return <VisualizationWrapper facade={Chart} data={this.state.data} />
  }
}

render(<Site/>, document.getElementById("app"))
