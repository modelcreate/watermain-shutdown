import React from "react";

import App from "../../components/App/App";
import useData from "../../hooks/useData";

import LayoutDropZone from "../../components/LayoutDropZone/LayoutDropZone";

import ModelFeatureCollection from "../../interfaces/ModelFeatureCollection";

import { ModelProvider } from "../../context/ModelContext";

//@ts-ignore
//const temp: ModelFeatureCollection = modelJSON;

function AppRouting() {
  const { modelLoaded, modelNew } = useData()!;

  return modelLoaded && modelNew.modelJSON ? (
    <ModelProivderWrapper model={modelNew.modelJSON} />
  ) : (
    <LayoutDropZone />
  );
}

export default AppRouting;

type ModelProivderWrapperProps = {
  model: ModelFeatureCollection; ////FeatureCollection<Geometries, Properties>;
};

function ModelProivderWrapper({ model }: ModelProivderWrapperProps) {
  const { modelNew } = useData()!;

  const dma = modelNew.dma as Object;
  const buildings = modelNew.buildings as Object;

  return (
    <>
      <ModelProvider model={model} dma={dma} buildings={buildings}>
        <App temp={model} />
      </ModelProvider>
    </>
  );
}
