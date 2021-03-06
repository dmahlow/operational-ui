"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_handler_1 = require("./data_handler");
var renderer_1 = require("./renderer");
var Series = /** @class */ (function () {
    function Series(state, stateWriter, events, el) {
        this.state = state;
        this.stateWriter = stateWriter;
        this.events = events;
        this.el = el;
        this.dataHandler = new data_handler_1.default(state, stateWriter);
        this.renderer = new renderer_1.default(state, events, el);
        this.drawn = false;
    }
    Series.prototype.prepareData = function () {
        this.data = this.dataHandler.prepareData();
        this.stateWriter("data", this.data);
    };
    Series.prototype.hasData = function () {
        return this.data.nodes != null && this.data.nodes.length > 0;
    };
    Series.prototype.draw = function () {
        var seriesConfig = this.state.current.get("computed").series;
        this.el.attr("width", seriesConfig.width).attr("height", seriesConfig.height);
        this.renderer.draw(this.data);
        this.drawn = true;
    };
    return Series;
}());
exports.default = Series;
//# sourceMappingURL=series.js.map