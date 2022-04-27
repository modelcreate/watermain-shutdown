import React, { useState, createContext, useMemo } from "react";

import ModelFeatureCollection from "../interfaces/ModelFeatureCollection";

type Props = {
  children: React.ReactNode;
};

interface ModelData {
  buildings: object | undefined;
  custLookup: object | undefined;
  dma: object | undefined;
  modelJSON: ModelFeatureCollection | undefined;
  modelinp: string | undefined;
}

type DataContextType = {
  modelNew: ModelData;
  loadModelData: (data: string, target: keyof ModelData) => void;
  modelLoaded: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: Props) {
  const [modelNew, setModelNew] = useState<ModelData>({
    buildings: undefined,
    custLookup: undefined,
    dma: undefined,
    modelJSON: undefined,
    modelinp: undefined,
  });

  const loadModelData = (data: string, target: keyof ModelData) => {
    const updatedData = target === "modelinp" ? data : JSON.parse(data);
    setModelNew((prevState) => ({ ...prevState, [target]: updatedData }));
  };

  const modelLoaded = useMemo(() => {
    const isFilledWithData = Object.values(modelNew).every(
      (x) => x !== undefined
    );
    return isFilledWithData;
  }, [modelNew]);

  return (
    <DataContext.Provider
      value={{
        modelNew,
        loadModelData,
        modelLoaded,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const DataConsumer = DataContext.Consumer;

export default DataContext;
