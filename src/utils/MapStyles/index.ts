import {
  HydrantStyle,
  MainStyle,
  MeterStyle,
  ValveStyle,
  IsolationValveStyle,
  FixedHeadStyle,
  TransferNodeStyle,
  MapboxLightStyle,
  CalibrationActionStyle,
  CalibrationActionLabelStyle,
  CustPointStyle,
  CustAllocationStyle,
  BuildingFillStyle,
  BuildingOutlineStyle,
  TankStyle,
  PolygonFillStyle,
  PolygonOutlineStyle,
} from "./waterStyles";
import { fromJS } from "immutable";

import {
  FeatureCollection,
  Feature,
  Geometries,
  Properties,
  featureCollection,
  BBox,
  Geometry,
  GeometryCollection,
} from "@turf/helpers";

import { ShutOffBlockInfo } from "../../utils/Trace";

import center from "@turf/center";

import { concat } from "lodash";

import ModelFeatureCollection, {
  Demand,
} from "../../interfaces/ModelFeatureCollection";

export const getIsolationValveGeoJson = (
  modelGeoJson: FeatureCollection<Geometry | GeometryCollection, Properties>,
  isolationValves: ShutOffBlockInfo,
  openValveIds: string[]
): FeatureCollection<Geometries, Properties> => {
  const altSupplyValves = isolationValves.altSupplyValve.map((v) => {
    return v.id;
  });

  const filteredFeatures = modelGeoJson.features.filter(
    (feature) =>
      feature.properties !== null &&
      (isolationValves.isolationValves.includes(feature.id!.toString()) ||
        feature.properties?.pipe_closed === "1")
  );

  const centerFeatures = filteredFeatures.map((f) => {
    const newFeature = center(f, {
      properties: {
        id: f.properties?.id,
        asset_id: f.properties?.asset_id,
        type: openValveIds.includes(f.properties?.id)
          ? "open"
          : altSupplyValves.includes(f.id!.toString())
          ? "altSupply"
          : isolationValves.isolationValves.includes(f.id!.toString())
          ? "isolation"
          : "shutValve",
      },
    });
    newFeature.id = f.id;
    return newFeature;
  });

  return featureCollection(centerFeatures);
};

const extractAssetType = (geoJson: FeatureCollection, types: string[]) => {
  const filteredFeatures = geoJson.features.filter(
    (feature) =>
      feature.properties !== null && types.includes(feature.properties.table)
  );
  return featureCollection(filteredFeatures);
};

export const getDemands = (
  geoJson: ModelFeatureCollection
): FeatureCollection<Geometries, Properties> => {
  const nodeIds = Object.keys(geoJson.model.demands) as Array<
    keyof typeof geoJson.model
  >;

  const demands = nodeIds
    .reduce((acc, k) => {
      if (k === "") {
        // Unallocated
        return acc;
      }
      return concat(acc, geoJson.model.demands[k]);
    }, [] as Demand[])
    .filter((d) => d.connection_point_x); // Make sure connection point exisits

  const lines: Feature<Geometries, Properties>[] = demands.map((d) => {
    return {
      type: "Feature",
      id: parseInt(d.reference),
      geometry: {
        type: "LineString",
        coordinates: [
          [d.x, d.y],
          [d.connection_point_x, d.connection_point_y],
        ],
      },
      properties: {
        table: "wn_cust_line",
        id: d.reference,
      },
    };
  });

  return featureCollection(lines);
};

const createStyles = (
  geoJson: FeatureCollection<Geometry | GeometryCollection, Properties>,
  demandsGeoJson: FeatureCollection<Geometry | GeometryCollection, Properties>,
  dma: Object,
  buildings: Object
): object => {
  const wn_fixed_head = extractAssetType(geoJson, ["wn_fixed_head"]);
  const wn_hydrant = extractAssetType(geoJson, ["wn_hydrant"]);
  const wn_pipe = extractAssetType(geoJson, [
    "wn_pipe",
    "wn_meter",
    "wn_valve",
    "wn_non_return_valve",
  ]);
  const wn_meter = extractAssetType(geoJson, ["wn_meter"]);
  const wn_valve = extractAssetType(geoJson, [
    "wn_valve",
    "wn_non_return_valve",
  ]);
  const wn_transfer_node = extractAssetType(geoJson, ["wn_transfer_node"]);
  const wn_reservoir = extractAssetType(geoJson, ["wn_reservoir"]);

  const wn_cust_line = extractAssetType(demandsGeoJson, ["wn_cust_line"]);

  const immutBase = fromJS(MapboxLightStyle);
  const mapStyle = immutBase
    .setIn(
      ["sources", "hydrants"],
      fromJS({ type: "geojson", data: wn_hydrant })
    )
    .setIn(["sources", "mains"], fromJS({ type: "geojson", data: wn_pipe }))
    .setIn(
      ["sources", "transfernode"],
      fromJS({ type: "geojson", data: wn_transfer_node })
    )
    .setIn(
      ["sources", "fixedhead"],
      fromJS({ type: "geojson", data: wn_fixed_head })
    )
    .setIn(["sources", "meters"], fromJS({ type: "geojson", data: wn_meter }))
    .setIn(["sources", "valves"], fromJS({ type: "geojson", data: wn_valve }))
    .setIn(
      ["sources", "reservoirs"],
      fromJS({ type: "geojson", data: wn_reservoir })
    )
    .setIn(
      ["sources", "isovalves"],
      fromJS({
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      })
    )
    .setIn(
      ["sources", "cust_allocation"],
      fromJS({ type: "geojson", data: wn_cust_line })
    )
    .setIn(
      ["sources", "buildings"],
      fromJS({ type: "geojson", data: buildings })
    )
    .setIn(["sources", "dma"], fromJS({ type: "geojson", data: dma }))
    .set(
      "layers",
      immutBase
        .get("layers")
        .push(PolygonFillStyle)
        .push(PolygonOutlineStyle)
        .push(CustAllocationStyle)
        .push(BuildingFillStyle)
        .push(BuildingOutlineStyle)
        .push(MainStyle)
        .push(HydrantStyle)
        .push(MeterStyle)
        .push(ValveStyle)
        .push(IsolationValveStyle)
        .push(FixedHeadStyle)
        .push(TransferNodeStyle)
        .push(TankStyle)
    );

  return mapStyle;
};

const addImages = (map: mapboxgl.Map) => {
  if (map !== null) {
    map.addImage("meter", MeterStyle.toJS().images[0][1]);
    map.addImage("valve", ValveStyle.toJS().images[0][1]);
    map.addImage("prv", ValveStyle.toJS().images[8][1]);
    map.addImage("closedvalve", ValveStyle.toJS().images[4][1]);
    map.addImage("closedValveWOA", ValveStyle.toJS().images[7][1]);
    map.addImage("closedValveDMA", ValveStyle.toJS().images[5][1]);
    map.addImage("closedValveWSZ", ValveStyle.toJS().images[6][1]);
    map.addImage("nrv", ValveStyle.toJS().images[11][1]);
    map.addImage("triangleSolid", FixedHeadStyle.toJS().images[0][1]);
    map.addImage("squareSolid", TransferNodeStyle.toJS().images[0][1]);
    map.addImage("ca-valve", CalibrationActionStyle.toJS().images[0][1]);
    map.addImage("ca-point", CalibrationActionLabelStyle.toJS().images[0][1]);
  }
};

interface CalibrationActions {
  [id: string]: {
    [property: string]: number | string;
  };
}

function mergeCalibration(
  model: FeatureCollection,
  actions: CalibrationActions
): FeatureCollection {
  const updatedFeatures = model.features.map((f, i) => {
    if (f.properties && f.properties.id in actions) {
      const updatedFeature = {
        ...f,
        properties: {
          ...f.properties,
          i,
          ...actions[f.properties.id],
        },
      };

      return updatedFeature;
    } else {
      return {
        ...f,
        properties: {
          ...f.properties,
          i,
        },
      };
    }
  });

  const updatedModel = {
    ...model,
    features: updatedFeatures,
  };

  return updatedModel;
}

export { createStyles, addImages };
