import React from "react";
import Chart from "react-apexcharts";
import { formateDecimal } from "../../Utils/utils";

const PriceChart = (props) => {
  return (
    <Chart
      options={{
        chart: {
          type: "candlestick",
          height: 350,
          toolbar: {
            show: false,
          },
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          tooltip: {
            enabled: true,
          },
          labels: {
            formatter: (value) =>
              `${value ? "$" + formateDecimal(value, 4) : ""}`,
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
