import WaterIcons from "./waterIcons";
import { fromJS } from "immutable";

const layout = {
  visibility: "visible",
  "symbol-placement": "line-center",
  "icon-image": [
    "case",
    ["==", ["get", "pipe_closed"], "1"],
    "closedvalve",
    ["==", ["get", "mode"], "PRV"],
    "prv",
    ["==", ["get", "table"], "wn_non_return_valve"],
    "nrv",
    /* other */ "valve",
  ],
  "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 14, 0.4, 22, 1],
  "icon-rotate": ["*", ["get", "geom_orien"], -1],
  "text-field": "{description}",
  "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
  "text-offset": [0, 0.6],
  "text-anchor": "top",
  "text-size": 8,
  "text-optional": true,
  "icon-allow-overlap": true,
  "text-allow-overlap": false,
  "text-ignore-placement": false,
  "icon-ignore-placement": true,
};

const paint = {
  "icon-opacity": [
    "case",
    ["!=", ["feature-state", "isolated"], null],
    0,
    /* other */ 1,
  ],
};

const icons = {
  defaultValve: WaterIcons.defaultValve("#b300ff"),
  sensitiveValve: WaterIcons.defaultValve("#ff7f00"),
  washoutValve: WaterIcons.washoutValve,
  closedValve: WaterIcons.defaultClosedValve,
  closedValvePCCPRAPSA: WaterIcons.closedValve("#FFF"),
  closedValveDMA: WaterIcons.closedValve("#66bb6a"),
  closedValveWSZ: WaterIcons.closedValve("#ffc936"), //ffc936
  closedValveWOA: WaterIcons.closedValve("#e57373"),
  pressureReducing: WaterIcons.pressureReducing,
  pressureRelief: WaterIcons.pressureRelief,
  pressureSustaining: WaterIcons.pressureSustaining,
  refluxValve: WaterIcons.refluxValve,
  isolatedValve: WaterIcons.defaultValve("#bbb"),
};

let images = [];
for (const key in icons) {
  const iconImage = new Image();
  iconImage.src =
    "data:image/svg+xml;charset=utf-8;base64," +
    //@ts-ignore
    btoa(icons[key]);
  //btoa(WaterIcons.defaultValve("#b300ff"));
  images.push([key, iconImage]);
}

const ValveStyle = fromJS({
  id: "valve-geojson",
  source: "valves",
  type: "symbol",
  images,
  paint,
  layout,
  minZoom: 1,
});

export default ValveStyle;
