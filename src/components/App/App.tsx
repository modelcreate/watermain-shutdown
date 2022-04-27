import React from "react";
import useModel from "../../hooks/useModel";
import useData from "../../hooks/useData";
import { getCustToNodeLookup } from "../../utils/CustToNode";

import { EpanetProvider } from "../../context/EpanetContext";

import { ThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import Layout from "../Layout";
import { createTheme } from "../../theme";

import ModelFeatureCollection from "../../interfaces/ModelFeatureCollection";

interface AppProps {
  temp: ModelFeatureCollection;
}

interface FeatureLookup {
  [id: number]: string | number | undefined;
}

function App({ temp }: AppProps) {
  const { isolationArea, altSupplyValves, modelJSONProjected } = useModel()!;
  const { modelNew } = useData()!;

  const modelinp = modelNew.modelinp as string;
  const custLookup = modelNew.custLookup as Object;

  const valves = isolationArea?.isolationValvesAltIds;

  const isolatedNodeId = isolationArea
    ? [
        ...isolationArea?.shutOffBlock.nodes,
        ...isolationArea?.shutOffBlock.hydrants,
        ...isolationArea?.downstreamIsolated.nodes,
        ...isolationArea?.downstreamIsolated.hydrants,
      ]
    : [];
  const isolatedNodeModelId = isolatedNodeId?.map((v) => {
    return modelJSONProjected.features[v].properties?.node_id;
  }) as string[];

  const featureLookup = modelJSONProjected.features.reduce((obj, item) => {
    item.properties && (obj[item.properties.id] = item.id);
    return obj;
  }, {} as FeatureLookup);

  return (
    <EpanetProvider
      inp={modelinp}
      valves={valves}
      model={temp}
      isolatedNodeModelId={isolatedNodeModelId}
      custLookupTable={getCustToNodeLookup(temp)}
      custLookup={custLookup}
      openAltSupplyValves={altSupplyValves}
      featureLookup={featureLookup}
    >
      <ThemeProvider theme={createTheme()}>
        <CssBaseline />
        <Layout />
      </ThemeProvider>
    </EpanetProvider>
  );
}

export default App;
