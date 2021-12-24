import React from "react";
import Chart from "react-apexcharts";
import { formateDecimal } from "../../Utils/utils";

const PriceChart = (props) => {
  return (
    <Chart
      options={{
        title: {
          text: "Price",
          align: "left",
          style: {
            color: "#c3c5cb",
          },
        },
        chart: {
          type: "candlestick",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        noData: {
          text: "Loading...",
        },
        grid: {
          show: false,
          xaxis: {
            lines: {
              show: false,
            },
          },
        },
        xaxis: {
          type: "datetime",
          labels: {
            rotate: 0,
            axisTicks: {
              color: "#6c7284",
            },
            style: {
              color: "#c3c5cb",
            },
          },
          axisBorder: {
            show: false,
          },
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
          labels: {
            formatter: (value) =>
              `${value ? "$" + formateDecimal(value, 4) : ""}`,
            style: {
              color: "#c3c5cb",
            },
          },
        },
      }}
      series={[
        {
          data: props.data,
        },
      ]}
      type="candlestick"
      height={350}
    />
  );
};

export default PriceChart;
