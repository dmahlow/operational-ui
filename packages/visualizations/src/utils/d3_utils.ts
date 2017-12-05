import { easeLinear } from "d3-ease"

export const withD3Element = (func: any) => {
  return function(datum: any, ...args: any[]): any {
    return func(datum, this, ...args)
  }
}

function transitionOrSelection(selection: any, duration: number): any {
  return duration != null
    ? selection.transition()
      .duration(duration)
      .ease(easeLinear)
    : selection
}

export const setLineAttributes = (selection: any, attributes: any, duration?: number): void => {
  transitionOrSelection(selection, duration)
    .style("stroke", attributes.color)
    .attr("x1", attributes.x1)
    .attr("x2", attributes.x2)
    .attr("y1", attributes.y1)
    .attr("y2", attributes.y2)
}

export const setTextAttributes = (selection: any, attributes: any, duration?: number): void => {
  transitionOrSelection(selection, duration)
    .attr("x", attributes.x)
    .attr("y", attributes.y)
    .attr("dx", attributes.dx)
    .attr("dy", attributes.dy)
    .style("text-anchor", attributes.textAnchor)
    .attr("transform", attributes.transform)
    .text(attributes.labelText)
    .style("opacity", attributes.opacity || 1);
}

export const setPathAttributes = (selection: any, attributes: any, duration?: number): void => {
  // If 'color' is provided, it is used for both fill and stroke, unless these are explicitly set.
  transitionOrSelection(selection, duration)
    .attr("d", attributes.path)
    .style("fill", attributes.fill || attributes.color)
    .style("stroke", attributes.stroke || attributes.color)
    .style("opacity", attributes.opacity)
}