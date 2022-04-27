import { fromJS } from "immutable";

const layout = { visibility: "visible" };

const paintOutline = {
  "line-color": [
    "case",
    ["==", ["feature-state", "isolated"], "shutOffBlock"],
    "hsl(354, 63%, 87%)",
    ["==", ["feature-state", "isolated"], "downstreamIsolated"],
    "hsl(354, 63%, 87%)",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    "hsl(0, 0%, 72%)",
    ["==", ["feature-state", "isolated"], "newSupply"],
    "hsl(199, 90%, 77%)", //"#7af500",
    /* other */ "hsl(55, 3%, 87%)",
  ],
  "line-width": [
    "interpolate",
    ["exponential", 1.5],
    ["zoom"],
    15,
    0.75,
    20,
    3,
  ],
  "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, 1],
};

const paintFill = {
  "fill-outline-color": [
    "case",
    ["==", ["feature-state", "isolated"], "shutOffBlock"],
    "hsl(354, 63%, 87%)",
    ["==", ["feature-state", "isolated"], "downstreamIsolated"],
    "hsl(354, 63%, 87%)",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    "hsl(0, 0%, 72%)",
    ["==", ["feature-state", "isolated"], "newSupply"],
    "hsl(199, 90%, 77%)", //"#7af500",
    /* other */ "hsl(55, 3%, 87%)",
  ],

  //"hsl(55, 3%, 87%)",
  "fill-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, 1],
  "fill-color": [
    "case",
    ["==", ["feature-state", "isolated"], "shutOffBlock"],
    "hsl(354, 65%, 90%)",
    ["==", ["feature-state", "isolated"], "downstreamIsolated"],
    "hsl(354, 65%, 90%)",
    ["==", ["feature-state", "isolated"], "altSupplyAvailable"],
    "hsl(0, 0%, 75%)",
    ["==", ["feature-state", "isolated"], "newSupply"],
    "hsl(199, 92%, 80%)", //"#7af500",
    /* other */ "hsl(55, 5%, 91%)",
  ],
};

export const BuildingOutlineStyle = fromJS({
  id: "outline-build",
  source: "buildings",
  type: "line",
  paint: paintOutline,
  layout,
  minzoom: 15,
});

export const BuildingFillStyle = fromJS({
  id: "fill-build",
  source: "buildings",
  type: "fill",
  paint: paintFill,
  layout,
  minzoom: 15,
});
