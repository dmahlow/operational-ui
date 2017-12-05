import { css } from "glamor"

const tickStyle = {
  fontSize: "11px",
  fill: "#9c9c9c",
  "& .weekend": {
    fill: "#9d261d"
  },
  "& .now": {
    fill: "#71a934"
  }
}

const borderStyle = {
  stroke: "#eee",
  strokeWidth: 1,
  shapeRendering:"crispedges",
}

const rectStyle = {
  fill: "#fff"
}

export const tick = css(tickStyle).toString()
export const border = css(borderStyle).toString()
export const rect = css(rectStyle).toString()
