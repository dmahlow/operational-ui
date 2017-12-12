"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var series_1 = require("./series/series");
var fp_1 = require("lodash/fp");
var SeriesManager = /** @class */ (function () {
    function SeriesManager(state, stateWriter, events, el) {
        this.oldSeries = [];
        this.series = {};
        this.state = state;
        this.stateWriter = stateWriter;
        this.events = events;
        this.el = el;
    }
    SeriesManager.prototype.prepareData = function () {
        var dataSeries = this.state.current.get("accessors").data.series(this.state.current.get("data"));
        if (!dataSeries) {
            this.removeAll();
        }
        fp_1.forEach(function (series) { return series.key = series.key || fp_1.uniqueId("series"); })(dataSeries);
        var seriesKeys = fp_1.map(function (series) { return series.key; })(dataSeries);
        var computed = {};
        this.removeAllExcept(seriesKeys);
        fp_1.forEach(this.prepareSeries.bind(this))(dataSeries);
        fp_1.forEach(this.updateComputed(computed).bind(this))(this.series);
        this.stateWriter("requiredAxes", this.requiredAxes());
        this.stateWriter("hasData", this.hasData());
        this.stateWriter("computed", computed);
        this.stateWriter("dataForLegend", this.dataForLegend());
        this.addMissingDatapoints();
    };
    SeriesManager.prototype.hasData = function () {
        return fp_1.some(fp_1.result("hasData"))(this.series);
    };
    SeriesManager.prototype.prepareSeries = function (attributes) {
        this.updateOrCreate(attributes);
        if (attributes.data) {
            this.get(attributes.key).setData(attributes.data, attributes.total);
        }
    };
    SeriesManager.prototype.updateOrCreate = function (attributes) {
        var series = this.get(attributes.key);
        series != null ? series.update(attributes) : this.create(attributes);
    };
    SeriesManager.prototype.create = function (attributes) {
        this.series[attributes.key] = new series_1.default(this.state, attributes, this.state.current.get("accessors").series);
    };
    // Some renderers have width and are centred on ticks, so ticks need to be offset.
    SeriesManager.prototype.tickOffsetRequired = function (series, axis) {
        return series.dataFormat()[series.dataIndeces()[axis[0]]] !== "number" &&
            series.renderAs().indexOf("bars") > -1 ||
            series.renderAs().indexOf("bar_line") > -1;
    };
    SeriesManager.prototype.hasBars = function (series, axis) {
        return series.dataFormat()[series.dataIndeces()[axis[0]]] !== "number" &&
            series.renderAs().indexOf("bars") > -1;
    };
    SeriesManager.prototype.updateComputed = function (computed) {
        var _this = this;
        return function (series) {
            var axes = _this.state.current.get("accessors").data.axes(_this.state.current.get("data"));
            fp_1.reduce(function (memo, axis) {
                // Check compatible
                series.checkCompatible(axis, axes[axis].type);
                memo[axis] = memo[axis] || {
                    data: [],
                    series: [],
                    hasFlags: false,
                    // tickOffsetRequired: this.tickOffsetRequired(series, axis),
                    numberOfBars: 0,
                    barSeries: []
                };
                memo[axis].data = fp_1.flow(fp_1.concat(memo[axis].data), fp_1.uniq(), fp_1.sortBy(function (x) { return x; }))(series.dataForAxis(axis));
                memo[axis].series.push(series.key());
                memo[axis].numberOfBars += _this.tickOffsetRequired(series, axis) ? 1 : 0;
                if (_this.hasBars(series, axis)) {
                    var i = memo[axis].barSeries.length;
                    memo[axis].barSeries.push({ key: series.key(), index: i });
                }
                return memo;
            }, computed)([series.xAxis(), series.yAxis()]);
        };
    };
    SeriesManager.prototype.addMissingDatapoints = function () {
        var _this = this;
        fp_1.forEach(function (axis) {
            var series = _this.seriesForAxes()[axis];
            if (series.length > 1 && ["ordinal", "time"].indexOf(_this.state.current.get("data").axes[axis].type) > -1) {
                var requiredValues_1 = fp_1.flow(fp_1.map(function (d) { return d.dataForAxis(axis); }), fp_1.flatten, fp_1.uniq, fp_1.sortBy(function (x) { return x; }))(series);
                fp_1.forEach(function (d) {
                    d.addMissingDatapoints(axis, requiredValues_1);
                })(series);
            }
        })(this.required);
    };
    SeriesManager.prototype.get = function (sid) {
        return this.series[sid];
    };
    SeriesManager.prototype.remove = function (sid) {
        var series = this.series[sid];
        if (!series) {
            return;
        }
        this.oldSeries.push(series);
        delete this.series[sid];
    };
    SeriesManager.prototype.removeAll = function () {
        fp_1.flow(fp_1.keys, fp_1.forEach(this.remove))(this.series);
    };
    SeriesManager.prototype.removeAllExcept = function (sids) {
        fp_1.flow(fp_1.keys, fp_1.filter(function (sid) { return sids.indexOf(sid) === -1; }), fp_1.forEach(this.remove))(this.series);
    };
    SeriesManager.prototype.draw = function () {
        // Clean up any old stuff
        fp_1.invoke("close")(this.oldSeries);
        this.oldSeries = [];
        // Draw the new stuff
        fp_1.forEach(function (series) {
            series.computeAxisMappings();
            series.draw();
        })(this.series);
    };
    SeriesManager.prototype.getLegendData = function (axis) {
        var series;
        if (axis) {
            series = fp_1.filter(function (d) {
                return d.yAxis() === axis || d.xAxis() === axis && !d.hideInLegend();
            })(this.series);
        }
        return fp_1.map(function (d) { return d.legendData(); })(series || this.series);
    };
    SeriesManager.prototype.dataForLegend = function () {
        var data = {
            top: { left: [], right: [] },
            bottom: { left: [] }
        };
        var xAxes = fp_1.uniq(fp_1.map(function (series) { return series.xAxis(); })(this.series)), yAxes = fp_1.uniq(fp_1.map(function (series) { return series.yAxis(); })(this.series));
        if (yAxes.length > 1) {
            data.top.left = this.getLegendData("y1");
            data.top.right = this.getLegendData("y2");
        }
        else if (xAxes.length > 1) {
            data.top.left = this.getLegendData("x2");
            data.bottom.left = this.getLegendData("x1");
        }
        else {
            data.top.left = this.getLegendData();
        }
        return data;
    };
    SeriesManager.prototype.requiredAxes = function () {
        this.required = fp_1.uniq(fp_1.reduce(function (memo, series) {
            memo.push(series.xAxis(), series.yAxis());
            return memo;
        }, [])(this.series));
        return this.required;
    };
    SeriesManager.prototype.seriesForAxes = function () {
        var _this = this;
        var seriesForAxes = {};
        fp_1.forEach(function (axis) {
            var axisSeries = fp_1.filter(function (series) {
                return series.xAxis() === axis || series.yAxis() === axis;
            })(_this.series);
            seriesForAxes[axis] = axisSeries;
        })(this.state.current.get("computed").series.requiredAxes);
        this.stateWriter("seriesForAxes", seriesForAxes);
        return seriesForAxes;
    };
    return SeriesManager;
}());
exports.default = SeriesManager;
//# sourceMappingURL=series_manager.js.map