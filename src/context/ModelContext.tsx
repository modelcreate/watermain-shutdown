import React, { createContext, useState, useMemo } from "react";
import { createStyles, getDemands } from "../utils/MapStyles";
import { reprojectFeatureCollection } from "../utils/reproject";
import {
  FeatureCollection,
  Geometries,
  Geometry,
  GeometryCollection,
  Properties,
} from "@turf/helpers";

import { WebMercatorViewport } from "react-map-gl";
import bbox from "@turf/bbox";

import ModelFeatureCollection from "../interfaces/ModelFeatureCollection";

import { getShutOffBlockInfo, ShutOffBlockInfo } from "../utils/Trace";

type Props = {
  model: ModelFeatureCollection; ////FeatureCollection<Geometries, Properties>;
  dma: Object;
  buildings: Object;
  children: React.ReactNode;
};

interface InoperableValvesLookup {
  [name: string]: boolean;
}

export interface ModelViewport {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface AltSupplyValvesLookup {
  [name: string]: boolean;
}

type SelectionType = "info" | "break";

type ModelContextType = {
  style: object;
  modelViewport: ModelViewport;
  selectionMode: SelectionType;
  setSelectionMode: (value: SelectionType) => void;
  //setModelLoaded: (value: boolean) => void;
  inoperableValves: InoperableValvesLookup;
  handleInoperableValveChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  altSupplyValves: AltSupplyValvesLookup;
  handleAltSupplyValvesChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  isolationAsset?: string | undefined;
  isolationValveHighlight?: string | undefined;
  isolationArea?: ShutOffBlockInfo;
  setIsolationAsset: (id: string | undefined) => void;
  setIsolationValveHighlight: (id: string | undefined) => void;
  statHighlight?: string | undefined;
  setStatHighlight: (id: string | undefined) => void;
  modelJSONProjected: FeatureCollection<
    Geometry | GeometryCollection,
    Properties
  >;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ model, dma, buildings, children }: Props) {
  //const [modelLoaded, setModelLoaded] = useState<boolean>(false);

  const [selectionMode, setSelectionMode] = useState<SelectionType>("info");

  const [inoperableValves, setInoperableValves] =
    React.useState<InoperableValvesLookup>({
      checkedA: true,
      checkedB: true,
    });

  const [altSupplyValves, setAltSupplyValves] =
    React.useState<AltSupplyValvesLookup>({});

  const [isolationAsset, setIsolationAsset] = useState<string | undefined>(
    undefined
  );

  const [isolationValveHighlight, setIsolationValveHighlight] = useState<
    string | undefined
  >(undefined);

  const [statHighlight, setStatHighlight] = useState<string | undefined>(
    undefined
  );

  const modelJSONProjected = useMemo(() => {
    return reprojectFeatureCollection(
      model,
      //"+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +datum=OSGB36 +units=m +no_defs" // Britsh National Grid
      model.crs.properties.proj4
      //"+proj=utm +zone=17 +datum=NAD83 +units=m +no_defs" // NAD83 UTM ZONE 17N
    );
  }, [model]);

  const modelViewport: ModelViewport = useMemo(() => {
    const modelBbox = bbox(modelJSONProjected);

    const { longitude, latitude, zoom } = new WebMercatorViewport({
      width: 800,
      height: 600,
    }).fitBounds(
      [
        [modelBbox[0], modelBbox[1]],
        [modelBbox[2], modelBbox[3]],
      ],
      {
        padding: 20,
        offset: [0, -100],
      }
    );

    return { longitude, latitude, zoom };
  }, [modelJSONProjected]);

  //console.log(getDemands(model))
  const modelDemands = useMemo(() => {
    return reprojectFeatureCollection(
      getDemands(model),
      //"+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +datum=OSGB36 +units=m +no_defs" // Britsh National Grid
      model.crs.properties.proj4
      //"+proj=utm +zone=17 +datum=NAD83 +units=m +no_defs" // NAD83 UTM ZONE 17N
    );
  }, [model]);

  const handleInoperableValveChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInoperableValves({
      ...inoperableValves,
      [event.target.name]: event.target.checked,
    });
  };

  const handleAltSupplyValvesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAltSupplyValves({
      ...altSupplyValves,
      [event.target.name]: event.target.checked,
    });
  };

  const style = useMemo(() => {
    return createStyles(modelJSONProjected, modelDemands, dma, buildings);
  }, [buildings, dma, modelDemands, modelJSONProjected]);

  const isolationArea = useMemo(() => {
    if (isolationAsset) {
      setAltSupplyValves({}); //Reset open alt supply valves
      const iA = getShutOffBlockInfo(
        modelJSONProjected,
        isolationAsset,
        inoperableValves,
        model.model.demands
      );

      return iA;
    }

    return undefined;
  }, [
    inoperableValves,
    isolationAsset,
    model.model.demands,
    modelJSONProjected,
  ]);

  return (
    <ModelContext.Provider
      value={{
        selectionMode,
        modelViewport,
        setSelectionMode,
        modelJSONProjected,
        isolationArea,
        isolationAsset,
        inoperableValves,
        handleInoperableValveChange,
        altSupplyValves,
        handleAltSupplyValvesChange,
        isolationValveHighlight,
        setIsolationValveHighlight,
        setIsolationAsset,
        setStatHighlight,
        statHighlight,
        style: style,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export const ModelConsumer = ModelContext.Consumer;

export default ModelContext;
