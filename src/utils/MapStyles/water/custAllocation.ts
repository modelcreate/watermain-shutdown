import { fromJS } from "immutable";

const layout = { visibility: "visible" };

const paint = {
  "line-color": [
    "case",
    ["==", ["feature-state", "isolated"], "shutOffBlock"],
    "#ffcdd2", //"#ffcdd2",
    ["==", ["feature-state", "isolated"], "downstreamIsolated"], //"#e31a1c",
    "#ffcdd2", //"#ff7f00",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    "hsl(0, 0%, 52%)", //"#7af500",
    /* other */ "hsl(55, 3%, 87%)",
  ],

  //[
  //  "case",
  //  ["!=", ["feature-state", "isolated"], null],
  //  "green",
  //  "#7986cb",
  //], //"#555",
  //"line-dasharray": [0, 1, 1, 0],

  "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, 1],
  //  "line-opacity": [
  //    "let",
  //    "test",
  //    ["case", ["!=", ["feature-state", "isolated"], null], 1.8, 1],
  //    [
  //      "interpolate",
  //      ["linear"],
  //      ["zoom"],
  //      14,
  //      0,
  //      15,
  //      ["*", 0.15, ["var", "test"]],
  //      16,
  //      ["*", 0.3, ["var", "test"]],
  //      17,
  //      0.8,
  //    ],
  //  ],

  "line-width": 1,
};

const CustAllocationStyle = fromJS({
  id: "cust-allocation-geojson",
  source: "cust_allocation",
  type: "line",
  paint,
  layout,
  minZoom: 14,
});

export default CustAllocationStyle;
