import * as React from "react"
import glamorous, { GlamorousComponent, withTheme } from "glamorous"
import { darken, hexOrColor } from "@operational/utils"
import { Theme } from "@operational/theme"

import Tab, { IProps as TabProps } from "./Tab"

export interface IProps {
  active?: number
  activeColor?: string
  children?: React.ReactNode
  onChange?: (index: number) => void
}

export interface IPropsWithTheme extends IProps {
  theme: Theme
}

const Container = glamorous.div({
  /* Add any styles to the container */
})

const Content = glamorous.div({
  marginTop: 18
})

const TabList = glamorous.ul(
  {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    position: "relative",
    border: "none",
    "&:after": {
      position: "absolute",
      display: "block",
      content: " ",
      width: "100%",
      height: 1,
      left: 0,
      bottom: 0,
      background: "red",
      zIndex: 1
    },
    "> *:not(:last-child)": {
      marginRight: 20
    }
  },
  ({ theme }: { theme: Theme }) => ({
    "&:after": {
      background: darken(theme.colors.gray20)(6)
    }
  })
)

const TabPanel = glamorous.div({
  /* Add any styles to the TabPanel */
})

const overflowEllipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}

const TabTitle = glamorous.li(
  {
    cursor: "pointer",
    flex: "0 0 auto",
    listStyle: "none",
    maxWidth: "100%",
    position: "relative",
    padding: "5px 15px",
    zIndex: 10
  },
  ({
    theme,
    color,
    isActive,
    disabled
  }: {
    theme: Theme
    color: string
    isActive: boolean
    disabled: boolean
  }): {} => ({
    ...theme.typography.body,
    ...overflowEllipsis,
    borderBottom: `2px solid transparent`,
    ...isActive
      ? {
          color,
          borderColor: color
        }
      : {},
    ...disabled
      ? {
          color: theme.colors.gray60,
          cursor: "not-allowed"
        }
      : {
          "&:hover": {
            color
          }
        }
  })
)

const Tabs: React.SFC<IPropsWithTheme> = ({
  active = 0,
  activeColor = "info",
  children,
  onChange = () => {},
  theme
}: IPropsWithTheme) => {
  // Get all children properties and add an index value to each of them
  const childrenProps: TabProps[] = React.Children.map(
    children,
    (child: React.ReactElement<TabProps>, index: number) => ({ ...child.props, index })
  )

  const color = hexOrColor(activeColor)(theme.colors[activeColor] || theme.colors.info)

  // Display only the active panel based off the children props
  const { children: panelContent, disabled }: TabProps = childrenProps.find(({ index }) => index === active)
  const activePanel: JSX.Element = disabled ? null : <TabPanel>{panelContent}</TabPanel>

  // Build titles fragment based off the children props
  const tabTitles: JSX.Element[] = childrenProps.map(({ disabled, index, title }) => (
    <TabTitle
      color={color}
      disabled={disabled}
      isActive={active === index && !disabled}
      key={index}
      onClick={() => {
        if (!disabled) onChange(index)
      }}
    >
      {title}
    </TabTitle>
  ))

  return (
    <Container>
      <TabList>{tabTitles}</TabList>
      <Content>{activePanel}</Content>
    </Container>
  )
}

const WrappedTabs: React.SFC<IProps> = withTheme(Tabs)

export { WrappedTabs as Tabs, Tab }
