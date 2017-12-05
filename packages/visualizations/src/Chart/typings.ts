// Type definitions for the Contiamo Process Flow visualization
import * as d3 from "d3-selection"
import Series from "./series/series"

import {
  IAccessors,
  IEvents,
  IObject,
  IState,
  Partial,
  TD3Selection,
  TSeriesEl,
  TStateWriter,
} from "../utils/typings"

export {
  IAccessors,
  IEvents,
  IObject,
  IState,
  Partial,
  TD3Selection,
  TSeriesEl,
  TStateWriter,
}

export type TAccessors = IObject

export interface IDataAccessors {
}

export interface ISeriesAccessors {
}

export interface IAccessorsObject {
  data: IDataAccessors
  series: ISeriesAccessors
}

export interface IAxisConfig {
  margin: number
  minTicks: number
  minTopOffsetTopTick?: number
  noAxisMargin: number
  tickOffset: number
  tickSpacing: number
}

export interface IConfig {
  axisPaddingForFlags: number
  barLineThickness: number
  barPadding: number
  dateFocusLabelMargin: number
  duration: number
  durationCollapse: number
  durationRedraw: number
  elementFocusLabelMargin: number
  eventFlagAxisOffset: number
  flagHeight: number
  flagWidth: number
  focusDateOptions: string[]
  focusFormatter: (num: number) => string
  focusOnHover: boolean
  height: number
  legend: boolean
  maxBarWidthRatio: number
  maxLabelWidth: number
  maxLegendRatio: number
  maxLegendWidth: number
  minBarTickWidth: {
    ord: number
  }
  minBarWidth: number
  minChartWithLegend: number
  minLegendWidth: number
  numberFormatter: (x: number) => string
  showComponentFocus: boolean
  targetLineColor: string
  textlabels: {
    offset: {
      default: number
      points: number
    }
    rotate: {
      horizontal: number
      vertical: number
    }
  }
  timeAxisPriority: string[]
  uid: string,
  visualizationName: string
  width: number
  x1: IAxisConfig
  x2: IAxisConfig
  y1: IAxisConfig
  y2: IAxisConfig
}

export interface IComputedState {
  axes: IObject
  canvas: IObject
  focus: IObject
  legend: IObject
  series: IObject
}

export type ISeries = Series
