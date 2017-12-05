import * as React from "react"

import Table from "../../../components/PropsTable/PropsTable"
import Playground from "../../../components/Playground/Playground"
import { Card, CardHeader } from "contiamo-ui-components"
import { Chart, VisualizationWrapper } from "contiamo-visualizations"

import * as simpleSnippet from "./snippets/BarChart.simple.snippet"

export default () => (
  <Card>
    <CardHeader>Bar Charts</CardHeader>

    <h4>Usage</h4>
    <Playground snippet={String(simpleSnippet)} scope={{ Chart }} components={{ VisualizationWrapper }} />
  </Card>
)
