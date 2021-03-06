// Type definitions

export type ThemeColorName =
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "white"
  | "black"
  | "gray10"
  | "gray20"
  | "gray30"
  | "gray40"
  | "gray50"
  | "gray60"
  | "gray70"
  | "gray80"
  | "gray90"
  | "background"
  | "bodyText"
  | "emphasizedText"
  | "lightText"
  | "linkText"
  | "cardBackground"
  | "border"
  | "sidenavBackground"
  | "secondarySeparator"
  | "separator"

export interface ThemeColors {
  [key: string]: string
  brand: string
  info: string
  success: string
  warning: string
  error: string
  white: string
  black: string
  gray10: string
  gray20: string
  gray30: string
  gray40: string
  gray50: string
  gray60: string
  gray70: string
  gray80: string
  gray90: string
  background: string
  bodyText: string
  emphasizedText: string
  lightText: string
  linkText: string
  cardBackground: string
  border: string
  sidenavBackground: string
  secondarySeparator: string
  separator: string
}

export interface ThemeShadows {
  pressed: string
  card: string
  focus: string
  popup: string
}

export interface ThemeTypographyElement {
  fontSize: number
  fontWeight: 100 | 300 | 400 | 600 | 700 | "normal" | "bold" | "bolder" | "lighter" | "initial" | "inherit"
  textTransform: string
  letterSpacing: number | "normal"
  lineHeight: string
  color?: string
  "&::before"?: { content: string }
}

export interface ThemeTypography {
  title: ThemeTypographyElement
  heading1: ThemeTypographyElement
  heading2: ThemeTypographyElement
  body: ThemeTypographyElement
  small: ThemeTypographyElement
}

export interface Theme {
  colors: ThemeColors
  typography: ThemeTypography
  fontFamily: string
  spacing: number
  baseZIndex: number
  shadows: ThemeShadows
}

// Default theme definition

const colors: ThemeColors = {
  brand: "#000000",
  info: "#1499CE",
  success: "#00b34d",
  warning: "#FFAE00",
  error: "#DE1A1A",
  white: "#FFFFFF",
  black: "#000000",
  gray10: "#F8F8F8",
  gray20: "#e8e8e8",
  gray30: "#D0D0D0",
  gray40: "#C6C6C6",
  gray50: "#BBBBBB",
  gray60: "#999999",
  gray70: "#808080",
  gray80: "#747474",
  gray90: "#444444",
  background: "#F1F1F1",
  bodyText: "#555f61",
  cardBackground: "#FFFFFF",
  border: "#dadada",
  emphasizedText: "#373d3f",
  lightText: "#969696",
  linkText: "#1499CE",
  sidenavBackground: "#393939",
  separator: "#f2f2f2",
  secondarySeparator: "#f8f8f8"
}

const baseTypography: { lineHeight: string; textTransform: string; letterSpacing: number | "normal" } = {
  lineHeight: "1.5",
  textTransform: "none",
  letterSpacing: "normal"
}

const typography: ThemeTypography = {
  title: {
    ...baseTypography,
    fontSize: 22,
    fontWeight: 600
  },
  heading1: {
    ...baseTypography,
    fontSize: 13,
    fontWeight: 700,
    color: "#373d3f"
  },
  heading2: {
    ...baseTypography,
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase",
    color: "#969696",
    "&::before": {
      content: "» "
    }
  },
  body: {
    ...baseTypography,
    fontSize: 13,
    fontWeight: 400
  },
  small: {
    ...baseTypography,
    fontSize: 12,
    fontWeight: 400
  }
}

const shadows: ThemeShadows = {
  pressed: "inset 0 1px 1px rgba(0,0,0,0.15)",
  card: "0px 1px 2px #d3d1d1",
  focus: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(82,168,236,.6)",
  popup: "0 3px 12px rgba(0, 0, 0, .14)"
}

const operational: Theme = {
  typography,
  shadows,
  colors,
  spacing: 12,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  baseZIndex: 0
}

export { operational }
