import { fromJS } from "immutable";

const layout = { visibility: "visible" };

const paint = {
  "line-color": [
    "case",
    ["==", ["feature-state", "isolated"], "shutOffBlock"],
    "#f44336",
    ["==", ["feature-state", "isolated"], "downstreamIsolated"], //"#e31a1c",
    "#ffcdd2", //"#ff7f00",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    "#555", //"#7af500",
    ["==", ["feature-state", "isolated"], "newSupply"],
    "#29b6f6", //"#7af500",
    ["==", ["get", "operationa"], "Abandoned"],
    "#7af500",
    ["==", ["get", "operationa"], "Removed"],
    "#7af500",
    ["==", ["get", "operationa"], "Isolated"],
    "#5e9294",
    ["==", ["get", "operationa"], "Proposed"],
    "#ff7f00",
    ["==", ["get", "type"], "Fire"],
    "#00ffff",
    ["==", ["get", "type"], "Distributi"],
    "#1528f7",
    ["==", ["get", "type"], "Trunk"],
    "#e31a1c",
    /* other */ "#1528f7",
  ],
  "line-opacity": [
    "case",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    0.8,
    /* other */ 1,
  ],
  "line-width": [
    "case",
    ["!=", ["feature-state", "isolated"], null],
    3,
    /* other */ [
      "step",
      ["get", "diameter"],
      1,
      100,
      1.5,
      200,
      2,
      300,
      3,
      400,
      3.5,
    ],
  ],
};

const MainStyle = fromJS({
  id: "main-geojson",
  source: "mains",
  type: "line",
  paint,
  layout,
});

export default MainStyle;
