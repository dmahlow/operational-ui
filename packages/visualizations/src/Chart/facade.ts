import SeriesManager from "./series_manager"
import Canvas from "./canvas"
import LegendManager from "./legend_manager"
import AxesManager from "./axes_manager"
// import Focus from "./focus"
import Events from "../utils/event_catalog"
import StateHandler from "../utils/state_handler"
import EventEmitter from "../utils/event_bus"
import { IAccessors, IAccessorsObject, IAxisConfig, IConfig, IObject, Partial, IComputedState } from "./typings"
import { defaults, uniqueId } from "lodash/fp"

const xAxisConfig: Partial<IAxisConfig> = {
  margin: 14,
  minTicks: 2,
  noAxisMargin: 3,
  tickSpacing: 65
}

const yAxisConfig: Partial<IAxisConfig> = {
  margin: 34,
  minTicks: 4,
  minTopOffsetTopTick: 21,
  noAxisMargin: 21,
  tickSpacing: 40
}

class ProcessFlow {
  __disposed: boolean = false
  axes: AxesManager
  canvas: Canvas
  components: IObject
  context: Element
  events: EventEmitter
  legend: LegendManager
  series: SeriesManager
  state: StateHandler<IConfig>

  constructor(context: Element) {
    this.context = context
    this.events = new EventEmitter()
    this.initializeState()
    this.insertCanvas()
    this.initializeComponents()
    this.initializeSeries()
  }

  initializeState(): void {
    this.state = new StateHandler({
      data: {},
      config: this.initialConfig(),
      accessors: this.initialAccessors(),
      computed: {}
    })
  }

  // @TODO Check all are necessary once chart porting is finished
  initialConfig(): IConfig {
    return {
      axisPaddingForFlags: 15,
      barLineThickness: 2,
      barPadding: 2,
      dateFocusLabelMargin: 20,
      duration: 400,
      durationCollapse: 0.33,
      durationRedraw: 0.67,
      elementFocusLabelMargin: 7,
      eventFlagAxisOffset: 10,
      flagHeight: 10,
      flagWidth: 8,
      focusDateOptions: ["label", "line", "points"],
      focusFormatter: (num: number): string => num.toString(),
      focusOnHover: true,
      height: 500,
      legend: true,
      maxBarWidthRatio: 1 / 3,
      maxLabelWidth: 250,
      maxLegendRatio: 1 / 2,
      maxLegendWidth: 200,
      minBarTickWidth: {
        ordinal: 13
      },
      minBarWidth: 3,
      minChartWithLegend: 100,
      minLegendWidth: 50,
      numberFormatter: (x: number): string => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      showComponentFocus: true,
      targetLineColor: "#999",
      textlabels: {
        offset: {
          default: 2,
          points: 5
        },
        rotate: {
          horizontal: 0,
          vertical: -60
        }
      },
      timeAxisPriority: ["x1", "x2", "y1", "y2"],
      uid: uniqueId("chart"),
      visualizationName: "chart",
      width: 500,
      x1: defaults(xAxisConfig)({ tickOffset: 12 }),
      x2: defaults(xAxisConfig)({ tickOffset: -4 }),
      y1: defaults(yAxisConfig)({ tickOffset: -4 }),
      y2: defaults(yAxisConfig)({ tickOffset: 4 })
    }
  }

  initialAccessors(): IAccessorsObject {
    return {
      data: {
        series: (d: IObject) => d.series,
        axes: (d: IObject) => d.axes
      },
      series: {
        color: (d: any): string => d.color || "#ddd",
        data: (d: any): any => d.data || [],
        dataFormat: (d: any): [string, string] => d.dataFormat || ["date", "number"],
        dataIndeces: (d: any): any => d.dataIndeces || { x: 0, y: 1 },
        xAxis: (d: any): string => d.xAxis || "x1",
        yAxis: (d: any): string => d.yAxis || "y1",
        name: (d: any): string => d.name || "",
        key: (d: any): string => d.key || uniqueId("series"),
        hideInLegend: (d: any): boolean => d.hideInLegend || false,
        unit: (d: any): string => d.unit || "",
        formatter: (d: any): any => d.formatter || String,
        renderAs: (d: any): any => d.renderAs,
      }
    }
  }

  insertCanvas(): void {
    this.canvas = new Canvas(
      this.state.readOnly(),
      this.state.computedWriter(["canvas"]),
      this.events,
      this.context
    )
  }

  initializeComponents(): void {
    this.components = {
      legend: new LegendManager(
        this.state.readOnly(),
        this.state.computedWriter(["legend"]),
        this.events,
        this.canvas.elementFor("legend")
      ),
      axes: new AxesManager(
        this.state.readOnly(),
        this.state.computedWriter(["axes"]),
        this.events,
        this.canvas.elementFor("axes")
      )
      // focus: new Focus(
      //   this.state.readOnly(),
      //   this.state.computedWriter(["focus"]),
      //   this.events,
      //   this.canvas.elementFor("focus"),
      // ),
    }
  }

  initializeSeries(): void {
    this.series = new SeriesManager(
      this.state.readOnly(),
      this.state.computedWriter(["series"]),
      this.events,
      this.canvas.elementFor("series"),
    )
  }

  data<T>(data?: T): T {
    return this.state.data(data)
  }

  config(config?: Partial<IConfig>): IConfig {
    return this.state.config(config)
  }

  accessors(type: string, accessors: IObject): IAccessors {
    return this.state.accessors(type, accessors)
  }

  on(event: string, handler: any): void {
    this.events.on(event, handler)
  }

  off(event: string, handler: any): void {
    this.events.removeListener(event, handler)
  }

  draw(): Element {
    this.state.captureState()
    this.series.prepareData()

    // let drawAll = (): void => {
    this.components.legend.draw()
    this.canvas.draw()
    this.components.axes.draw()
    this.series.draw()
    //   this.components.focus.adaptToData();
    //   this.series.computeStack();
    //   this.components.axes.compute();
    //   this.series.computeRanges();
    //   this.series.compute();
    //   this.canvas.draw();
    //   this.components.axes.draw();
    //   this.series.draw();
    //   this.components.focus.refresh();
    // }
    // drawAll()

    // this.redraw(drawAll);
    // this.drawn = true;
    // this.dirty = false;

    return this.canvas.elementFor("series").node()
  }

  close(): void {
    if (this.__disposed) {
      return
    }
    this.__disposed = true
    this.events.removeAll()
    this.context.innerHTML = ""
  }
}

export default ProcessFlow
