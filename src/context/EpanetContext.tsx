import React, {
  useState,
  useEffect,
  createContext,
  useMemo,
  useRef,
} from "react";

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import EpanetWorker from "worker-loader!../utils/worker/runEpanet.worker";
import ModelFeatureCollection from "../interfaces/ModelFeatureCollection";
import { RunEpanetWorkerType } from "../utils/worker/runEpanet.worker";

import * as Comlink from "comlink";
import { EpanetResults } from "epanet-js";

import { AltSupplyValvesLookup } from "../context/ModelContext";

import { CustToNode } from "../utils/CustToNode";
import { AccountCircleRounded } from "@material-ui/icons";

import { ShutOffBlockInfo } from "../utils/Trace";

//@ts-ignore
const usePrevious = (value, initialValue) => {
  //@ts-ignore
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

//@ts-ignore
const useEffectDebugger = (effectHook, dependencies, dependencyNames = []) => {
  //@ts-ignore
  const previousDeps = usePrevious(dependencies, []);

  //@ts-ignore
  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log("[use-effect-debugger] ", changedDeps);
  }

  useEffect(effectHook, dependencies);
};

type Props = {
  inp: string; ////FeatureCollection<Geometries, Properties>;
  custLookupTable: CustToNode;
  valves: [string, string][] | undefined;
  custLookup: Object;
  isolatedNodeModelId: string[];
  model: ModelFeatureCollection;
  openAltSupplyValves: AltSupplyValvesLookup;
  children: React.ReactNode;
  featureLookup: FeatureLookup;
};

export type NetworkIssueSummary = {
  below15: string[];
  reducedBy10: string[];
  increasedBy10: string[];
  highVelocity: string[];
  flowReversals: string[];
};

interface FeatureLookup {
  [id: number]: string | number | undefined;
}

type EpanetContextType = {
  currentSelectedNode: [number[], undefined] | [number[], number[]] | undefined;
  selectedAsset: SelectedAssetInfo | undefined;
  setSelectedAsset: (id: SelectedAssetInfo | undefined) => void;
  isModelRunning: boolean;
  isModelError: boolean;
  setIsModelError: (status: boolean) => void;
  isAltModelRunning: boolean;
  networkIssueSummary: NetworkIssueSummary;
  setIsAltModelRunning: (status: boolean) => void;
};

type SelectedAssetDataType = "node" | "link" | "customer";
export type SelectedAssetInfo = {
  id: string;
  type: SelectedAssetDataType;
  properties: {
    [name: string]: any;
  };
};

const EpanetContext = createContext<EpanetContextType | undefined>(undefined);

export function EpanetProvider({
  inp,
  custLookupTable,
  model,
  isolatedNodeModelId,
  valves,
  custLookup,
  openAltSupplyValves,
  children,
  featureLookup,
}: Props) {
  const [selectedAsset, setSelectedAsset] = useState<
    SelectedAssetInfo | undefined
  >(undefined);
  const [isModelRunning, setIsModelRunning] = useState(false);
  const [modelResults, setModelResults] = useState<EpanetResults | undefined>(
    undefined
  );

  const [isAltModelRunning, setIsAltModelRunning] = useState(true);
  const [modelResultsAlt, setModelResultsAlt] = useState<
    EpanetResults | undefined
  >(undefined);

  const [isModelError, setIsModelError] = React.useState(false);

  useEffect(() => {
    const startDummyWorker = async () => {
      setIsModelRunning(true);
      const worker = new EpanetWorker();
      // Use Comlink's `wrap` function with the instance to get a function.
      const runEpanet = Comlink.wrap<RunEpanetWorkerType>(worker);
      // Invoke our function for a result like any Promise-returning function.
      const result = await runEpanet(inp);
      setModelResults(result);
      setIsModelRunning(false);
    };

    startDummyWorker();
  }, [inp]);

  useEffectDebugger(() => {
    const openValveIds = Object.keys(openAltSupplyValves)
      .filter((k) => openAltSupplyValves[k])
      .map((k) => k);

    if (valves) {
      const startDummyWorker = async () => {
        setIsAltModelRunning(true);
        const worker = new EpanetWorker();
        // Use Comlink's `wrap` function with the instance to get a function.
        const runEpanet = Comlink.wrap<RunEpanetWorkerType>(worker);
        // Invoke our function for a result like any Promise-returning function.
        try {
          const result = await runEpanet(
            inp,
            valves,
            openValveIds,
            isolatedNodeModelId
          );
          setModelResultsAlt(result);
        } catch (err) {
          setModelResultsAlt(undefined);
          setIsModelError(true);
          console.log(err);
        }

        setIsAltModelRunning(false);
      };

      startDummyWorker();
    }
  }, [inp, openAltSupplyValves, valves]);

  const currentSelectedNode = useMemo(() => {
    if (selectedAsset === undefined) {
      return undefined;
    }

    if (selectedAsset.type === "link") {
      const result = modelResults?.results.links.filter(
        (f) => f.id === selectedAsset.id
      );
      const altResult = modelResultsAlt?.results.links.filter(
        (f) => f.id === selectedAsset.id
      );

      if (result && result?.length > 0 && altResult === undefined) {
        return [result[0].flow, undefined];
      }

      if (result && result?.length > 0 && altResult) {
        return [result[0].flow, altResult[0].flow];
      }

      return undefined;
    }

    let nodeId: string = "";

    if (selectedAsset.type === "customer") {
      for (let el of Object.keys(custLookup)) {
        //@ts-ignore
        if (custLookup[el] === selectedAsset.id) {
          nodeId = custLookupTable[el];
          break;
        }
      }
    } else if (selectedAsset.type === "node") {
      nodeId = selectedAsset.id;
    }

    const result = modelResults?.results.nodes.filter((f) => f.id === nodeId);
    const altResult = modelResultsAlt?.results.nodes.filter(
      (f) => f.id === nodeId
    );

    if (result && result?.length > 0 && altResult === undefined) {
      return [result[0].pressure, undefined];
    }

    if (result && result?.length > 0 && altResult) {
      return [result[0].pressure, altResult[0].pressure];
    }

    return undefined;
  }, [
    custLookup,
    custLookupTable,
    modelResults,
    modelResultsAlt,
    selectedAsset,
  ]) as [number[], undefined] | [number[], number[]] | undefined;

  const networkIssueSummary: NetworkIssueSummary = useMemo(() => {
    if (!modelResults || !modelResultsAlt) {
      return {
        below15: [],
        reducedBy10: [],
        increasedBy10: [],
        highVelocity: [],
        flowReversals: [],
      };
    }

    const below15 = modelResultsAlt.results.nodes
      .filter(
        (f) => f.pressure.some((p) => p < 15) && model.model.demands[f.id]
      )
      .map((f) => model.model.demands[f.id].map((c) => c.reference))
      .flat();

    // TODO: We're repeating loops here, we could do this all i the same loop
    const reducedBy10 = modelResultsAlt.results.nodes.reduce((acc, node, i) => {
      const minAlt = Math.min(...node.pressure);
      const minBase = Math.min(...modelResults.results.nodes[i].pressure);

      if (minBase - minAlt > 10 && model.model.demands[node.id]) {
        const custId = model.model.demands[node.id].map((c) => c.reference);
        acc.push(...custId);
        return acc;
      } else {
        return acc;
      }
    }, [] as string[]);

    const increasedBy10 = modelResultsAlt.results.nodes.reduce(
      (acc, node, i) => {
        const minAlt = Math.min(...node.pressure);
        const minBase = Math.min(...modelResults.results.nodes[i].pressure);

        if (minAlt - minBase > 10 && model.model.demands[node.id]) {
          const custId = model.model.demands[node.id].map((c) => c.reference);
          acc.push(...custId);
          return acc;
        } else {
          return acc;
        }
      },
      [] as string[]
    );

    const highVelocity = modelResultsAlt.results.links.reduce(
      (acc, link, i) => {
        const maxVelcoityAlt = Math.max.apply(
          null,
          link.velocity.map(Math.abs)
        );
        const maxVelcoityBase = Math.max.apply(
          null,
          modelResults.results.links[i].velocity.map(Math.abs)
        );

        if (maxVelcoityAlt > 0.4 && maxVelcoityBase / maxVelcoityAlt > 1.2) {
          //@ts-ignore
          acc.push(featureLookup[link.id]);
          return acc;
        } else {
          return acc;
        }
      },
      [] as string[]
    );

    const flowReversals = modelResultsAlt.results.links.reduce(
      (acc, link, i) => {
        // For base and alt sim, in each snapshot find the direction of fow -1 negative, 0 no flow, 1 positive
        // Sum these sorted into a [number, number, number] array
        // Find the index of the largest number, if its changed the pipe has change signficantly in direction

        const altFlowState = link.flow.reduce(
          (altAcc, f) => {
            Math.sign(Math.round(f * 100) / 100) === 0
              ? altAcc[1]++
              : Math.sign(f) === 1
              ? altAcc[2]++
              : altAcc[0]++;
            return altAcc;
          },
          [0, 0, 0] as [number, number, number]
        );

        const baseFlow = modelResults.results.links[i].flow;
        const baseFlowState = baseFlow.reduce(
          (altAcc, f) => {
            Math.sign(Math.round(f * 100) / 100) === 0
              ? altAcc[1]++
              : Math.sign(f) === 1
              ? altAcc[2]++
              : altAcc[0]++;
            return altAcc;
          },
          [0, 0, 0] as [number, number, number]
        );

        var altFlowStateIndexOfMaxValue = altFlowState.reduce(
          (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
          0
        );
        var baseFlowStateIndexOfMaxValue = baseFlowState.reduce(
          (iMax, x, i, arr) => (x > arr[iMax] ? i : iMax),
          0
        );

        // If alt sim isn't mostly zero flow and the direction has changed, flag pipe
        if (
          altFlowStateIndexOfMaxValue !== 1 &&
          altFlowStateIndexOfMaxValue !== baseFlowStateIndexOfMaxValue
        ) {
          //@ts-ignore
          acc.push(featureLookup[link.id]);
          return acc;
        }

        return acc;
      },
      [] as string[]
    );

    return {
      below15,
      reducedBy10,
      increasedBy10,
      highVelocity,
      flowReversals,
    };
  }, [featureLookup, model.model.demands, modelResults, modelResultsAlt]);

  return (
    <EpanetContext.Provider
      value={{
        isModelRunning,
        isAltModelRunning,
        setIsAltModelRunning,
        currentSelectedNode,
        selectedAsset,
        isModelError,
        networkIssueSummary,
        setIsModelError,
        setSelectedAsset,
      }}
    >
      {children}
    </EpanetContext.Provider>
  );
}

export const EpanetConsumer = EpanetContext.Consumer;

export default EpanetContext;
