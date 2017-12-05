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
        this.stateWriter("series", this.series);
        this.stateWriter("oldSeries", this.oldSeries);
        this.stateWriter("hasData", this.hasData());
        this.stateWriter("computed", computed);
        this.exportData();
    };
    SeriesManager.prototype.hasData = function () {
        return fp_1.some(fp_1.result("hasData"))(this.series);
    };
    // @TODO Move to individual series?
    SeriesManager.prototype.exportData = function () {
        this.multipleAxes();
        this.requiredAxes();
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
        this.series[attributes.key] = new series_1.default(attributes, this.state.current.get("accessors").series);
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
                    tickOffsetRequired: false
                };
                memo[axis].data = fp_1.flow(fp_1.concat(memo[axis].data), fp_1.uniq(), fp_1.sortBy(function (x) { return x; }))(series.dataForAxis(axis));
                memo[axis].series.push(series.key());
                return memo;
            }, computed)([series.xAxis(), series.yAxis()]);
        };
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
        fp_1.invoke("draw")(this.series);
    };
    SeriesManager.prototype.multipleAxes = function () {
        var xAxes = fp_1.uniq(fp_1.map(function (series) { return series.xAxis(); })(this.series)), yAxes = fp_1.uniq(fp_1.map(function (series) { return series.yAxis(); })(this.series));
        if (yAxes.length > 1) {
            this.stateWriter("multipleAxes", "y");
        }
        if (xAxes.length > 1) {
            this.stateWriter("multipleAxes", "x");
        }
    };
    SeriesManager.prototype.requiredAxes = function () {
        var required = fp_1.uniq(fp_1.reduce(function (memo, series) {
            memo.push(series.xAxis());
            memo.push(series.yAxis());
            return memo;
        }, [])(this.series));
        this.stateWriter("requiredAxes", required);
    };
    SeriesManager.prototype.seriesForAxes = function () {
        var _this = this;
        var axes = {};
        fp_1.forEach(function (axis) {
            axes[axis] = fp_1.filter(function (series) {
                return series.xAxis() === axis || series.yAxis() === axis;
            })(_this.series);
        })(["x1", "x2", "y1", "y2"]);
        this.stateWriter("seriesForAxes", axes);
    };
    return SeriesManager;
}());
exports.default = SeriesManager;
//# sourceMappingURL=series_manager.js.map