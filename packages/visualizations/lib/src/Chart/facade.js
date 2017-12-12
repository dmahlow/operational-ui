"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var series_manager_1 = require("./series_manager");
var canvas_1 = require("./canvas");
var legend_manager_1 = require("./legend_manager");
var axes_manager_1 = require("./axes_manager");
var state_handler_1 = require("../utils/state_handler");
var event_bus_1 = require("../utils/event_bus");
var fp_1 = require("lodash/fp");
var xAxisConfig = {
    margin: 14,
    minTicks: 2,
    noAxisMargin: 3,
    tickSpacing: 65
};
var yAxisConfig = {
    margin: 34,
    minTicks: 4,
    minTopOffsetTopTick: 21,
    noAxisMargin: 21,
    tickSpacing: 40
};
var ProcessFlow = /** @class */ (function () {
    function ProcessFlow(context) {
        this.__disposed = false;
        this.context = context;
        this.events = new event_bus_1.default();
        this.initializeState();
        this.insertCanvas();
        this.initializeComponents();
        this.initializeSeries();
    }
    ProcessFlow.prototype.initializeState = function () {
        this.state = new state_handler_1.default({
            data: {},
            config: this.initialConfig(),
            accessors: this.initialAccessors(),
            computed: {}
        });
    };
    // @TODO Check all are necessary once chart porting is finished
    ProcessFlow.prototype.initialConfig = function () {
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
            focusFormatter: function (num) { return num.toString(); },
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
            numberFormatter: function (x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); },
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
            uid: fp_1.uniqueId("chart"),
            visualizationName: "chart",
            width: 500,
            x1: fp_1.defaults(xAxisConfig)({ tickOffset: 12 }),
            x2: fp_1.defaults(xAxisConfig)({ tickOffset: -4 }),
            y1: fp_1.defaults(yAxisConfig)({ tickOffset: -4 }),
            y2: fp_1.defaults(yAxisConfig)({ tickOffset: 4 })
        };
    };
    ProcessFlow.prototype.initialAccessors = function () {
        return {
            data: {
                series: function (d) { return d.series; },
                axes: function (d) { return d.axes; }
            },
            series: {
                color: function (d) { return d.color || "#ddd"; },
                data: function (d) { return d.data || []; },
                dataFormat: function (d) { return d.dataFormat || ["date", "number"]; },
                dataIndeces: function (d) { return d.dataIndeces || { x: 0, y: 1 }; },
                xAxis: function (d) { return d.xAxis || "x1"; },
                yAxis: function (d) { return d.yAxis || "y1"; },
                name: function (d) { return d.name || ""; },
                key: function (d) { return d.key || fp_1.uniqueId("series"); },
                hideInLegend: function (d) { return d.hideInLegend || false; },
                unit: function (d) { return d.unit || ""; },
                formatter: function (d) { return d.formatter || String; },
                renderAs: function (d) { return d.renderAs; },
            }
        };
    };
    ProcessFlow.prototype.insertCanvas = function () {
        this.canvas = new canvas_1.default(this.state.readOnly(), this.state.computedWriter(["canvas"]), this.events, this.context);
    };
    ProcessFlow.prototype.initializeComponents = function () {
        this.components = {
            legend: new legend_manager_1.default(this.state.readOnly(), this.state.computedWriter(["legend"]), this.events, this.canvas.elementFor("legend")),
            axes: new axes_manager_1.default(this.state.readOnly(), this.state.computedWriter(["axes"]), this.events)
            // focus: new Focus(
            //   this.state.readOnly(),
            //   this.state.computedWriter(["focus"]),
            //   this.events,
            //   this.canvas.elementFor("focus"),
            // ),
        };
    };
    ProcessFlow.prototype.initializeSeries = function () {
        this.series = new series_manager_1.default(this.state.readOnly(), this.state.computedWriter(["series"]), this.events, this.canvas.elementFor("series"));
    };
    ProcessFlow.prototype.data = function (data) {
        return this.state.data(data);
    };
    ProcessFlow.prototype.config = function (config) {
        return this.state.config(config);
    };
    ProcessFlow.prototype.accessors = function (type, accessors) {
        return this.state.accessors(type, accessors);
    };
    ProcessFlow.prototype.on = function (event, handler) {
        this.events.on(event, handler);
    };
    ProcessFlow.prototype.off = function (event, handler) {
        this.events.removeListener(event, handler);
    };
    ProcessFlow.prototype.draw = function () {
        this.state.captureState();
        this.series.prepareData();
        // let drawAll = (): void => {
        this.components.legend.draw();
        this.canvas.draw();
        this.components.axes.draw();
        this.series.draw();
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
        return this.canvas.elementFor("series").node();
    };
    ProcessFlow.prototype.close = function () {
        if (this.__disposed) {
            return;
        }
        this.__disposed = true;
        this.events.removeAll();
        this.context.innerHTML = "";
    };
    return ProcessFlow;
}());
exports.default = ProcessFlow;
//# sourceMappingURL=facade.js.map