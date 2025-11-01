import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const LineChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600, height = 300;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
      .domain([0, data.length * 2])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.temperature, d.humidity, d.irradiance))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = key =>
      d3.line()
        .x((d, i) => x(i * 2))
        .y(d => y(d[key]));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    ["temperature", "humidity", "irradiance"].forEach((key, i) => {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", ["red", "blue", "green"][i])
        .attr("stroke-width", 2)
        .attr("d", line(key));
    });
  }, [data]);

  return data.length === 0 ? <p>No sensor data yet...</p> : <svg ref={ref} width={600} height={300} />;
};

export default LineChart;
