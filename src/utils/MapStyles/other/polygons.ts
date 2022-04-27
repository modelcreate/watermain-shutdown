import { fromJS } from "immutable";

const layout = { visibility: "visible" };

const paintOutline = {
  "line-color": "rgb(112, 184, 184)",
  "line-width": [
    "interpolate",
    ["exponential", 1.5],
    ["zoom"],
    15,
    0.75,
    20,
    4,
  ],
  //"line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, 1],
};

const paintFill = {
  "fill-outline-color": "rgb(0, 0, 0)",
  //"hsl(55, 3%, 87%)",
  //"fill-opacity": 0.1,
  "fill-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0.1, 16, 0],
  "fill-color": "rgb(0, 128, 128)",
};

export const PolygonOutlineStyle = fromJS({
  id: "polygon-dma-outline",
  source: "dma",
  type: "line",
  paint: paintOutline,
  layout,
  //minzoom: 15,
});

export const PolygonFillStyle = fromJS({
  id: "polygon-dma-fill",
  source: "dma",
  type: "fill",
  paint: paintFill,
  layout,
  //minzoom: 15,
});
