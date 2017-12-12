import { css } from "glamor"

const lineStyle = {
  "& path": {
    strokeWidth: "2px",
    fill: "none",
    "&.hover": {
      strokeWidth: "4px",
    },
  },
  "& path.dashed": {
    strokeDasharray: "6, 4"
  }
}

const textlabelStyle = {
  "& text": {
    fontSize: "10px",
    fill: "#333"
  }
}

const barsStyle = {
  "& rect": {
    opacity: "0.8",
    fill: "none",
    shapeRendering: "crispedges",
    "&.hover": {
      opacity: "1"
    }
  }
}

export const line = css(lineStyle).toString()
export const textlabels = css(textlabelStyle).toString()
export const bars = css(barsStyle).toString()
