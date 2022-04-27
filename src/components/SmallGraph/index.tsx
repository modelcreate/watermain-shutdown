import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import {
  VictoryLabel,
  VictoryChart,
  VictoryLine,
  VictoryLegend,
  VictoryAxis,
  VictoryTheme,
} from "victory";

interface SmallChartProps {
  modelData: [number[], undefined] | [number[], number[]];
  axisLabel: string;
}

const useStyles = makeStyles((theme) => ({
  container: { paddingTop: "15px" },
}));

const SCALER_TEST = 1;

function SmallChart({ modelData, axisLabel }: SmallChartProps) {
  const modelDataUpdated: [number[], undefined] | [number[], number[]] = [
    [],
    [],
  ];
  modelDataUpdated[0] = modelData[0].map((d) => d * SCALER_TEST);
  const testB = modelData[1]
    ? modelData[1].map((d) => d * SCALER_TEST)
    : undefined;
  //@ts-ignore
  modelDataUpdated[1] = testB;

  const classes = useStyles();
  const lineData = modelDataUpdated[0].map((d, i) => {
    return { x: i, y: d };
  });
  let lineDataAlt:
    | {
        x: number;
        y: number;
      }[]
    | undefined = undefined;
  if (modelDataUpdated[1]) {
    lineDataAlt = modelDataUpdated[1].map((d, i) => {
      return { x: i, y: d };
    });
  }

  const allValues = modelDataUpdated[1]
    ? [...modelDataUpdated[0], ...modelDataUpdated[1]]
    : modelDataUpdated[0];
  const isValuesAllPositive = allValues.every((v) => v >= 0);
  const isValuesAllNegative = allValues.every((v) => v <= 0);
  const isValuesAllZero = allValues.every((v) => v === 0);
  const isValuesMixofPositiveAndNegatives =
    !isValuesAllPositive && !isValuesAllNegative && !isValuesAllZero;

  const series1MaxValue = Math.max(...modelDataUpdated[0]);
  const maxValue = modelDataUpdated[1]
    ? Math.max(...modelDataUpdated[1], series1MaxValue)
    : series1MaxValue;

  const series1MinValue = Math.min(...modelDataUpdated[0]);
  const minValue = modelDataUpdated[1]
    ? Math.min(...modelDataUpdated[1], series1MinValue)
    : series1MinValue;

  let maxDomain = 0;
  let minDomain = 0;
  let leftPadding = 0;
  let topPadding = 5;
  let bottomPadding = 40;

  if (isValuesAllPositive) {
    maxDomain = maxValue < 1 ? maxValue : Math.ceil(maxValue / 5) * 5;
    minDomain = 0;
    const decimals = maxDomain > 5 ? 0 : maxDomain < 1 ? 4 : 2;
    leftPadding =
      Math.abs(Math.floor(Math.log(Math.abs(maxDomain)) / Math.log(10) + 1)) +
      decimals;
  } else if (isValuesAllNegative) {
    minDomain = minValue > -1 ? minValue : Math.floor(minValue / 5) * 5;
    maxDomain = 0;
    const decimals = minDomain < -5 ? 0 : minDomain > -1 ? 4 : 2;
    leftPadding =
      Math.abs(Math.floor(Math.log(Math.abs(minDomain)) / Math.log(10) + 1)) +
      decimals;
    topPadding = 30;
    bottomPadding = 5;
  } else if (isValuesAllZero) {
    maxDomain = 5;
  } else if (isValuesMixofPositiveAndNegatives) {
    minDomain = minValue > -1 ? minValue : Math.floor(minValue / 5) * 5;
    maxDomain = maxValue < 1 ? maxValue : Math.ceil(maxValue / 5) * 5;

    const maxAbs = Math.max(Math.abs(minDomain), maxDomain);
    const decimals = maxDomain > 5 ? 0 : maxDomain < 1 ? 4 : 2;
    leftPadding =
      Math.abs(Math.floor(Math.log(Math.abs(maxAbs)) / Math.log(10) + 1)) +
      decimals;
  }

  //const maxDomain = maxValue < 1 ? maxValue : Math.ceil(maxValue / 5) * 5;
  //const leftPadding = (Math.log(maxDomain ) * Math.LOG10E + 1) | 0; // for positive integers

  //const leftPadding =
  //  Math.abs(Math.floor(Math.log(Math.abs(maxDomain)) / Math.log(10) + 1)) +
  //  minusAddition;

  return (
    <div className={classes.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        height={240}
        width={330}
        //containerComponent={<VictoryContainer responsive={false} />}
        padding={{
          top: topPadding,
          left: 30 + leftPadding * 7,
          right: 10,
          bottom: bottomPadding,
        }}
        domainPadding={{ y: 20 }}
        minDomain={{ y: minDomain, x: 0 }}
        maxDomain={{ y: maxDomain, x: 95 }}
      >
        <VictoryAxis
          style={{
            axisLabel: { fontSize: 13, padding: 28 },
            tickLabels: {
              fontSize: 14,
              padding: 5,
              paintOrder: "stroke",
              stroke: "#fff",
              strokeWidth: "4px",
            },
          }}
          crossAxis={false}
          dependentAxis
          tickLabelComponent={<VictoryLabel dx={4} />}
          label={axisLabel}
        />

        <VictoryAxis
          style={{
            axisLabel: { fontSize: 8, padding: 30 },
            tickLabels: { fontSize: 14, padding: 5 },
          }}
          tickValues={[23, 47, 71]}
          tickFormat={(t) => `${(t + 1) / 4}:00`}
          scale={{ x: "time" }}
          //label={"Time (hours)"}
          tickLabelComponent={<VictoryLabel dy={-5} />}
        />
        <VictoryLine
          style={{
            data: { stroke: "#000" },
          }}
          data={lineData}
        />
        {lineDataAlt && (
          <VictoryLine
            data={lineDataAlt}
            style={{
              data: { stroke: "#c43a31" },
            }}
          />
        )}
        <VictoryLegend
          x={102}
          y={222}
          orientation="horizontal"
          gutter={20}
          //style={{ border: { stroke: "black" } }}
          //colorScale={["black", "red"]}
          data={[
            { name: "Base", symbol: { fill: "black", type: "minus" } },
            { name: "Incident", symbol: { fill: "#c43a31", type: "minus" } },
          ]}
        />
      </VictoryChart>
    </div>
  );
}

export default SmallChart;
