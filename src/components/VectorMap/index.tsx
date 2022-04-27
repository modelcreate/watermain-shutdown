import React, { useState, useEffect, useMemo } from "react";

import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import { addImages, getIsolationValveGeoJson } from "../../utils/MapStyles";

import useModel from "../../hooks/useModel";
import useEpanet from "../../hooks/useEpanet";
import useData from "../../hooks/useData";

import { IsolationAreaInfo } from "../../utils/Trace";
import { assignMapFeatureState } from "../../utils/MapFeatureState";

import InfoPanel from "../InfoPanel";
import SelectType from "./Overlays/SelectType";

import ReactMapGL, { PointerEvent } from "react-map-gl";
import { Map } from "mapbox-gl";

import { ModelViewport } from "../../context/ModelContext";

const useStyles = makeStyles((theme) => ({
  selectTypeOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    marginTop: "10px",
    marginRight: "15px",
    background: "#000",
    border: "2px",
    borderRadius: "30px",
    zIndex: 2,
  },
}));

interface VectorMapProps {
  modelViewport: ModelViewport;
}

function VectorMap({ modelViewport }: VectorMapProps) {
  const { longitude, latitude, zoom } = modelViewport;
  const classes = useStyles();
  const [viewport, setViewport] = useState({
    width: 400,
    height: 100,
    longitude,
    latitude,
    zoom,
  });
  const [map, setMap] = useState<Map | undefined>();

  const {
    style,
    selectionMode,
    modelJSONProjected,
    isolationAsset,
    isolationArea,
    setIsolationAsset,
    isolationValveHighlight,
    altSupplyValves,
    statHighlight,
  } = useModel()!;

  const { modelNew } = useData()!;

  const custLookup = modelNew.custLookup as Object;

  const {
    setIsAltModelRunning,
    currentSelectedNode,
    selectedAsset,
    setSelectedAsset,
    networkIssueSummary,
  } = useEpanet()!;

  const openAltSupplyValves = useMemo(() => {
    return Object.keys(altSupplyValves).reduce((acc, valveId) => {
      if (altSupplyValves[valveId]) {
        acc.push(valveId);
        return acc;
      }
      return acc;
    }, [] as string[]);
  }, [altSupplyValves]);

  const newSupplyAssets = useMemo(() => {
    if (isolationArea === undefined) {
      return;
    }

    // Figure out if a valve is open, get its ID
    // Look at EPANET openAltSupplyValves and see which are set to true
    // Look through altSupplyValvesAltIds find where index 1 matches
    // Use that index to find Ids
    // get an id array of pipes, valves, hydrants, nodes and customers that now ahve supply
    // Check on loop if they are in array and if so skip, maybe later we give a different style

    const supplyAssets = isolationArea.altSupplyValvesAltIds.reduce(
      (acc, id, i) => {
        if (openAltSupplyValves.includes(id[0])) {
          const areaInfo = isolationArea.altSupplyValve[i].supplies;
          acc.pipes.push(...areaInfo.pipes);
          acc.customers.push(...areaInfo.customers);
          acc.valves.push(...areaInfo.valves);
          acc.hydrants.push(...areaInfo.hydrants);

          return acc;
        }
        return acc;
      },
      {
        pipes: [],
        customers: [],
        valves: [],
        hydrants: [],
        nodes: [],
      } as IsolationAreaInfo
    );

    return supplyAssets;
  }, [isolationArea, openAltSupplyValves]);

  useEffect(() => {
    if (isolationArea === undefined || newSupplyAssets === undefined) {
      return;
    }
    const geoValves = getIsolationValveGeoJson(
      modelJSONProjected,
      isolationArea,
      openAltSupplyValves
    );

    if (map) {
      assignMapFeatureState(
        geoValves,
        isolationArea,
        map,
        custLookup,
        newSupplyAssets,
        isolationValveHighlight,
        statHighlight,
        networkIssueSummary
      );
    }
  }, [
    custLookup,
    isolationArea,
    isolationValveHighlight,
    map,
    modelJSONProjected,
    networkIssueSummary,
    newSupplyAssets,
    openAltSupplyValves,
    statHighlight,
  ]);

  const _onClick = (event: PointerEvent) => {
    if (
      event &&
      event.features &&
      event.features.length > 0 &&
      event.features[0].properties
    ) {
      if (
        selectionMode === "break" &&
        event.features[0].layer.id === "main-geojson"
      ) {
        //setIsAltModelRunning(true);
        setIsolationAsset(event.features[0].properties.id);
        //setTimeout(() => {
        //  setIsAltModelRunning(false);
        //}, 5000);

        // set isAltModelRunning to true
        // set timer to clear after five seconds
        //
      } else if (
        selectionMode === "info" &&
        event.features[0].layer.id === "fill-build"
      ) {
        setSelectedAsset({
          type: "customer",
          properties: event.features[0].properties,
          id: event.features[0].properties.id,
        });
      } else if (
        selectionMode === "info" &&
        event.features[0].layer.id === "hydrants-geojson"
      ) {
        setSelectedAsset({
          type: "node",
          properties: event.features[0].properties,
          id: event.features[0].properties.id,
        });
      } else if (
        selectionMode === "info" &&
        event.features[0].layer.id === "valve-geojson"
      ) {
        setSelectedAsset({
          type: "link",
          properties: event.features[0].properties,
          id: event.features[0].properties.id,
        });
      } else if (
        selectionMode === "info" &&
        event.features[0].layer.id === "main-geojson"
      ) {
        setSelectedAsset({
          type: "link",
          properties: event.features[0].properties,
          id: event.features[0].properties.id,
        });
      }
    } else {
      setIsolationAsset(undefined);
    }
  };

  return (
    <>
      {currentSelectedNode && selectedAsset && (
        <InfoPanel
          currentSelectedNode={currentSelectedNode}
          selectedAsset={selectedAsset}
        />
      )}

      <Box className={classes.selectTypeOverlay}>
        <SelectType />
      </Box>
      <ReactMapGL
        {...viewport}
        mapStyle={style}
        width="100%"
        height="100%"
        onClick={_onClick}
        clickRadius={2}
        ref={(ref) => ref && setMap(ref.getMap())}
        interactiveLayerIds={[
          "main-geojson",
          "fill-build",
          "hydrants-geojson",
          "valve-geojson",
        ]}
        onLoad={(event) => {
          addImages(event.target);
          console.log("loaded map");
        }}
        onViewportChange={setViewport}
      />
    </>
  );
}

export default VectorMap;
