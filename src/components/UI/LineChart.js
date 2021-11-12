import React, { useRef, useEffect, useCallback } from "react";
import * as d3 from "d3";

import classes from "./LineChart.module.css";

const LineChart = (props) => {
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

    const xScale = d3
      .scaleLinear()
      .domain([xMinValue, xMaxValue])
      .range([0, width]);

    const yScale = d3.scaleLinear().range([height, 0]).domain([0, yMaxValue]);

    const line = d3
      .line()
      .x((d) => xScale(d.label))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(""));

    svg
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(""));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom().scale(xScale).tickSize(15));

    svg
      .append("path")
      .datum(props.data)
      .attr("fill", "none")
      .attr("stroke", "#f6c3d0")
      .attr("stroke-width", 4)
      .attr("class", "line")
      .attr("d", line);
  }, [props.data]);

  useEffect(() => {
    drawChart(props.data);
    return () => {};
  }, [drawChart, props.data]);

  return <div ref={chRef} className={classes["line-container"]} />;
};

export default LineChart;
