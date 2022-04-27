import { fromJS } from "immutable";
import WaterIcons from "./waterIcons";

const layout = {
  visibility: "visible",
  "icon-image": "squareSolid",
  "icon-size": ["interpolate", ["exponential", 2], ["zoom"], 14, 0.2, 22, 1],
  "icon-allow-overlap": true,
  "icon-ignore-placement": true,
};
const paint = {
  "icon-opacity": {
    stops: [
      [15, 0],
      [16, 0.2],
      [17, 0.3],
    ],
  },
};

const icons = {
  squareSolid: WaterIcons.squareSolid,
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

const CustPointStyle = fromJS({
  id: "cust-point-geojson",
  source: "cust_points",
  type: "symbol",
  layout,
  paint,
  minZoom: 14,
});

export default CustPointStyle;
