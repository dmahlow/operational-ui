import * as React from "react"
import { render } from "enzyme"

import ThemelessSpinner from "../Spinner"
import wrapDefaultTheme from "../../utils/wrap-default-theme"

const Spinner = wrapDefaultTheme(ThemelessSpinner)

describe("Spinner Component", () => {
  it("Should render", () => {
    const renderedComponent = render(<Spinner value="SomeValue" />)
    expect(renderedComponent).toMatchSnapshot()
  })
})
