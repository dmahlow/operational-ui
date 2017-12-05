import * as React from "react"
import { Chart, VisualizationWrapper } from "contiamo-visualizations"

export default (function() {
  class Bars extends React.Component {
    state = {
      data: {
        series: [
          {
            key: "666569643:pageviews",
            name: "Pageviews",
            data: [
              [new Date("2015-09-27T22:00:00.000Z"), 15300],
              [new Date("2015-09-28T22:00:00.000Z"), 17200],
              [new Date("2015-09-29T22:00:00.000Z"), 18600],
              [new Date("2015-09-30T22:00:00.000Z"), 20500],
              [new Date("2015-10-01T22:00:00.000Z"), 20770],
              [new Date("2015-10-02T22:00:00.000Z"), "test"],
              [new Date("2015-10-03T22:00:00.000Z"), 22900],
              [new Date("2015-10-04T22:00:00.000Z"), 22100],
              [new Date("2015-10-05T22:00:00.000Z"), 23500],
              [23200, new Date("2015-10-06T22:00:00.000Z")]
            ],
            dataFormat: ["date", "number"],
            render: ["bars"],
            color: "#00f"
          },
          {
            key: "666569644:clicks",
            name: "Sales",
            data: [
              ["test2", 215300],
              [new Date("2015-09-28T22:00:00.000Z"), 317200],
              [new Date("2015-09-29T22:00:00.000Z"), 118600],
              [new Date("2015-09-30T22:00:00.000Z"), 220500],
              [new Date("2015-10-01T22:00:00.000Z"), 120770],
              [new Date("2015-10-02T22:00:00.000Z"), 320600],
              [new Date("2015-10-03T22:00:00.000Z"), 222900],
              [new Date("2015-10-04T22:00:00.000Z"), 122100],
              [new Date("2015-10-05T22:00:00.000Z"), 323500],
              [new Date("2015-10-06T22:00:00.000Z"), 223200]
            ],
            dataFormat: ["date", "number"],
            render: ["bars"],
            color: "#0f0",
            yAxis: "y2"
          }
        ],
        axes: {
          x1: {
            type: "time"
          },
          y1: {
            type: "quant",
            unit: "",
            formatter: (d: number): string => d.toLocaleString()
          },
          y2: {
            type: "quant",
            unit: "EUR",
            formatter: (d: number): string => d.toLocaleString()
          }
        }
      }
    }

    render() {
      return <VisualizationWrapper facade={Chart} data={this.state.data} />
    }
  }

  return (
    <div>
      <Bars />
    </div>
  )
})()
