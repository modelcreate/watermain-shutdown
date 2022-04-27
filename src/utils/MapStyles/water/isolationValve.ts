import { fromJS } from "immutable";

const layout = {
  visibility: "visible",
  "icon-image": [
    "case",
    ["==", ["get", "type"], "altSupply"],
    "closedValveDMA",
    ["==", ["get", "type"], "isolation"],
    "closedValveWOA",
    ["==", ["get", "type"], "open"],
    "closedValveWSZ",
    /* other */ "closedvalve",
  ],
  "icon-size": {
    base: 1.75,
    stops: [
      [10, 0.4],
      [22, 1],
    ],
  },
  "icon-rotate": ["*", ["get", "geom_orien"], -1],
  "text-field": [
    "case",
    ["==", ["get", "type"], "shutValve"],
    "",
    /* other */ ["concat", "V", ["get", "asset_id"]],
  ],

  //"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
  "text-radial-offset": 0.6,
  "text-justify": "auto",
  "text-variable-anchor": ["left", "right", "top", "bottom"],
  //"text-anchor": "left",
  "text-size": ["interpolate", ["linear"], ["zoom"], 14, 8, 18, 20],
  "text-rotate": 0,
  "text-optional": true,
  "icon-allow-overlap": true,
  "text-allow-overlap": false,
  "icon-ignore-placement": true,
};

const paint = {
  "text-opacity": [
    "case",
    ["==", ["feature-state", "highlighted"], true],
    1,
    /* other */ 0.8,
  ],
  "text-color": [
    "case",
    ["==", ["feature-state", "highlighted"], true],
    "white",
    /* other */ "black",
  ],
  "text-halo-color": [
    "case",
    ["==", ["feature-state", "highlighted"], true],
    "#333",
    /* other */ "white",
  ],
  "text-halo-width": [
    "case",
    ["==", ["feature-state", "highlighted"], true],
    2,
    /* other */ 2,
  ],
};

const IsolationValveStyle = fromJS({
  id: "iso-valve-geojson",
  source: "isovalves",
  type: "symbol",
  layout,
  paint,
  minZoom: 1,
});

export default IsolationValveStyle;
