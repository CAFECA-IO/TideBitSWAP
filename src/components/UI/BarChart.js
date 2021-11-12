import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

import classes from "./BarChart.module.css";

const BarChart = (props) => {
  const chRef = useRef();

  const drawChart = useCallback(() => {
    const svgContainer = d3.select(chRef.current).node();
    svgContainer.innerHTML = "";

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width =
        svgContainer.getBoundingClientRect().width - margin.left - margin.right,
      height =
        svgContainer.getBoundingClientRect().width * 0.85 -
        margin.top -
        margin.bottom;

    const yMinValue = d3.min(props.data, (d) => d.value);
    const yMaxValue = d3.max(props.data, (d) => d.value);
    const xMinValue = d3.min(props.data, (d) => d.label);
    const xMaxValue = d3.max(props.data, (d) => d.label);

    const svg = d3
      .select(chRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis: scale and draw:
    const xScale = d3
      .scaleLinear()
      .domain([xMinValue, xMaxValue])
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // set the parameters for the histogram
    const histogram = d3
      .bin()
      .value(function (d) {
        return d.value;
      }) // I need to give the vector of value
      .domain(xScale.domain()) // then the domain of the graphic
      .thresholds(xScale.ticks(70)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins = histogram(props.data);

    // Y axis: scale and draw:
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, yMaxValue]);
    yScale.domain([
      0,
      d3.max(bins, function (d) {
        return d.length;
      }),
    ]); // d3.hist has to be called before the Y axis obviously
    svg.append("g").call(d3.axisLeft(yScale));

    // append the bar rectangles to the svg element
    svg
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", 1)
      .attr("transform", function (d) {
        return `translate(${xScale(d.x0)} , ${yScale(d.length)})`;
      })
      .attr("width", function (d) {
        return xScale(d.x1) - xScale(d.x0) - 1;
      })
      .attr("height", function (d) {
        return height - yScale(d.length);
      })
      .style("fill", "#69b3a2");
  }, [props.data]);

  useEffect(() => {
    drawChart(props.data);
    return () => {};
  }, [drawChart, props.data]);

  return <div ref={chRef} className={classes["bar-container"]} />;
};

export default BarChart;
