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
        this.removeAllExcept(seriesKeys);
        fp_1.forEach(this.prepareSeries.bind(this))(dataSeries);
        this.stateWriter("axes", this.computeAxisInformation());
        this.stateWriter("dataForLegend", this.dataForLegend());
        this.addMissingDatapoints();
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
    SeriesManager.prototype.get = function (sid) {
        return this.series[sid];
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
    SeriesManager.prototype.requiredAxes = function () {
        this.required = fp_1.uniq(fp_1.reduce(function (memo, series) {
            memo.push(series.xAxis(), series.yAxis());
            return memo;
        }, [])(this.series));
        return this.required;
    };
    SeriesManager.prototype.hasBars = function (series, axis) {
        return series.dataFormat()[series.dataIndeces()[axis[0]]] !== "number" &&
            series.renderAs().indexOf("bars") > -1;
    };
    SeriesManager.prototype.computeAxisInformation = function () {
        var _this = this;
        var axes = this.state.current.get("accessors").data.axes(this.state.current.get("data"));
        return fp_1.reduce(function (memo, axisName) {
            var seriesForAxis = fp_1.filter(function (s) {
                return s.xAxis() === axisName || s.yAxis() === axisName;
            })(_this.series);
            memo[axisName] = {};
            memo[axisName].orientation = axisName[0];
            memo[axisName].series = fp_1.map(function (s) { return s.key(); })(seriesForAxis);
            memo[axisName].data = fp_1.flow(fp_1.map(function (s) { return s.dataForAxis(axisName); }), fp_1.flatten, fp_1.uniq, fp_1.sortBy(function (x) { return x; }))(seriesForAxis);
            memo[axisName].barSeries = fp_1.flow(fp_1.filter(function (s) { return _this.hasBars(s, axisName); }), fp_1.map.convert({ cap: false })(function (s, i) {
                return {
                    key: s.key(),
                    index: i
                };
            }))(seriesForAxis);
            return memo;
        }, {})(this.requiredAxes());
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
    SeriesManager.prototype.seriesForAxes = function () {
        var _this = this;
        var seriesForAxes = {};
        fp_1.forEach(function (axis) {
            var axisSeries = fp_1.filter(function (series) {
                return series.xAxis() === axis || series.yAxis() === axis;
            })(_this.series);
            seriesForAxes[axis] = axisSeries;
        })(this.requiredAxes());
        return seriesForAxes;
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
    return SeriesManager;
}());
exports.default = SeriesManager;
//# sourceMappingURL=series_manager.js.map