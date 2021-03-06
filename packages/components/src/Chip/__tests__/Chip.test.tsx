import * as React from "react"
import { render, mount } from "enzyme"

import ThemelessChip from "../Chip"
import wrapDefaultTheme from "../../utils/wrap-default-theme"

const Chip = wrapDefaultTheme(ThemelessChip)

describe("Chip", () => {
  it("Should render", () => {
    expect(render(<Chip>Hi</Chip>)).toMatchSnapshot()
  })
})
