import {
  FeatureCollection,
  Geometries,
  Properties,
  Feature,
} from "@turf/helpers";
import { featureReduce, coordEach } from "@turf/meta";
import clone from "@turf/clone";
import { featureCollection } from "@turf/helpers";
import proj4 from "proj4";

export function reprojectFeatureCollection(
  geoJson: FeatureCollection<Geometries, Properties>,
  fromProject: string
): FeatureCollection {
  const initialValue: Array<Feature> = [];

  const features = featureReduce(
    geoJson,
    function (previousValue, currentFeature, featureIndex) {
      const id = currentFeature.id ? currentFeature.id : featureIndex;
      const featureReproject = Object.assign(
        {},
        currentFeature,
        reprojectFeature(currentFeature, fromProject),
        { id }
      );
      return previousValue.concat(featureReproject);
    },
    initialValue
  );

  return featureCollection(features);
}

export function reprojectFeature(
  feature: Feature<Geometries, Properties>,
  fromProject: string
): Feature<Geometries, Properties> {
  const newFeature = clone(feature);

  coordEach(newFeature, function (currentCoord) {
    const newCoord = reprojectCoord(currentCoord, fromProject);
    currentCoord[0] = newCoord[0];
    currentCoord[1] = newCoord[1];
  });

  // TODO: Check again later, there is a bug in Mapbox GL JS where if the last two coords
  // are duplicates then it won't draw the line at high zooms. We will check here and remove
  // them if they exist
  // https://github.com/mapbox/mapbox-gl-js/issues/5171

  if (
    newFeature.geometry &&
    newFeature.geometry.type === "LineString" &&
    newFeature.geometry.coordinates.length > 2
  ) {
    const totalCoords = newFeature.geometry.coordinates.length;
    const x1 = newFeature.geometry.coordinates[totalCoords - 1][0];
    const x2 = newFeature.geometry.coordinates[totalCoords - 2][0];
    const y1 = newFeature.geometry.coordinates[totalCoords - 1][1];
    const y2 = newFeature.geometry.coordinates[totalCoords - 2][1];
    if (x1 == x2 && y1 == y2) {
      newFeature.geometry.coordinates.pop();
    }
  }

  return newFeature;
}

export function reprojectCoord(coord: number[], fromProject: string): number[] {
  //@ts-ignore
  return proj4(fromProject, proj4("EPSG:4326"), coord);
}
