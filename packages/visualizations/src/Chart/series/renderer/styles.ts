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

export const line = css(lineStyle).toString()
