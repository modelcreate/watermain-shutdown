import {
  FeatureCollection,
  Geometry,
  GeometryCollection,
  Properties,
  Feature,
} from "@turf/helpers";

import { NodeDemand } from "../../interfaces/ModelFeatureCollection";

import { difference, mergeWith, isArray } from "lodash";

// Finding shut off block
//
// Trace out from burst asset, stop at any valves

// Finding downstream isolations without alterantive supply
//
// Trace from fixed head but stop only the shut off area
// anything not found is has no alternative suppply

// Finding areas with alternative supplies
//
// Trace from fixed head but stop at burst area and closed valves
// minus this with the "downstream isolations" to get a list of areas with alterantive supply.

// Find valves taht could give alterantive supply
//
// Get a list of all closed valves and check its connection, if one side is closed and one is open
// then it is a candidate for an alternative supply

// Edge case, a shut off could actually create two sepearte response areas, so we may need to trace
// and see who would be supplied by openning valve, things like NRV could complicate this so they could
// overlap

// Get valves to shut
// Get customers in shut off block
// Get customers that are isolated (trace d/s of fixed head)

export interface IsolationAreaInfo {
  pipes: number[];
  valves: number[];
  hydrants: number[];
  nodes: number[];
  customers: number[];
}

interface AltSupplyValve {
  id: string;
  supplies: IsolationAreaInfo;
}

interface InoperableValvesLookup {
  [name: string]: boolean;
}

export interface ShutOffBlockInfo {
  burstPipe: string;
  brokenValves: string[];
  isolationValves: string[];
  isolationValvesAltIds: [string, string][];
  altSupplyValvesAltIds: [string, string][];
  shutOffBlock: IsolationAreaInfo;
  downstreamIsolated: IsolationAreaInfo;
  altSupplyAvailable: IsolationAreaInfo;
  altSupplyValve: AltSupplyValve[];
}

export function getShutOffBlockInfo(
  model: FeatureCollection<Geometry | GeometryCollection, Properties>,
  pipeId: string,
  nonOperationalValves: InoperableValvesLookup,
  demands: NodeDemand
): ShutOffBlockInfo {
  console.log(" || Starting getShutOffBlockInfo");
  const t1 = performance.now();
  const lookup = createGetIsolationAreaInfo(model, demands);
  console.log(
    ` || >> createGetIsolationAreaInfo - Time taken ${performance.now() - t1}`
  );

  const featureLookup = model.features.reduce((obj, item) => {
    item.properties && (obj[item.properties.id] = item);
    return obj;
  }, {} as FeatureLookup);

  const featureLookupIdNumber = model.features.reduce((obj, item) => {
    item.properties && item.id && (obj[item.id?.toString()] = item);
    return obj;
  }, {} as FeatureLookup);

  console.log(` || >> featureLookup - Time taken ${performance.now() - t1}`);

  const idToFeatureLookup = model.features.reduce((obj, item) => {
    if (typeof item.id === "number") {
      item.properties && (obj[item.id] = item);
    }
    return obj;
  }, {} as IdToFeatureLookup);

  console.log(
    ` || >> idToFeatureLookup - Time taken ${performance.now() - t1}`
  );

  const connectionlookup = findConnectedFeatures(model, featureLookup);

  console.log(` || >> connectionlookup - Time taken ${performance.now() - t1}`);

  const oldFunction = getShutOffBlock(
    pipeId,
    nonOperationalValves,
    connectionlookup,
    lookup
  );

  console.log(` || >> getShutOffBlock - Time taken ${performance.now() - t1}`);

  const isolationValves = oldFunction.isolationValves.map((v) => {
    return featureLookup[v].id!.toString();
  });

  const isolationValvesAltIds = oldFunction.isolationValves.map((v) => {
    //@ts-ignore
    return [v, featureLookup[v].properties.asset_id!.toString()] as [
      string,
      string
    ];
  });

  console.log(
    ` || >> oldFunction.isolationValves - Time taken ${performance.now() - t1}`
  );

  const fixedHeadsAndTanks: string[] = model.features
    .filter(
      (f) =>
        f.properties?.table === "wn_fixed_head" ||
        f.properties?.table === "wn_reservoir"
    )
    .map((f) => f.properties?.id);

  const traceFromFixedHead = createGetAreaFromFixedHead(
    connectionlookup,
    lookup,
    fixedHeadsAndTanks
  );

  console.log(
    ` || >> createGetAreaFromFixedHead- Time taken ${performance.now() - t1}`
  );

  const stopAtNothing = (
    f: Feature<Geometry | GeometryCollection, Properties>
  ) => {
    return false;
  };

  const stopAtIsolationValves = (
    f: Feature<Geometry | GeometryCollection, Properties>
  ) => {
    return oldFunction.isolationValves.includes(f.properties?.id);
  };

  const createAltSupplySearch = (altValveId: number) => {
    return (f: Feature<Geometry | GeometryCollection, Properties>) => {
      return (
        oldFunction.isolationValves.includes(f.properties?.id) ||
        (f.properties?.pipe_closed === "1" && f.id !== altValveId)
      );
    };
  };

  const stopAtIsolationValvesAndShutValves = (
    f: Feature<Geometry | GeometryCollection, Properties>
  ) => {
    return (
      oldFunction.isolationValves.includes(f.properties?.id) ||
      f.properties?.pipe_closed === "1"
    );
  };

  const stopAtShutValves = (
    f: Feature<Geometry | GeometryCollection, Properties>
  ) => {
    return (
      //oldFunction.isolationValves.includes(f.properties?.id) ||
      f.properties?.pipe_closed === "1"
    );
  };

  console.log(
    ` || >> rando function declorations - Time taken ${performance.now() - t1}`
  );

  const dsOfFixedHeadAllAsset = traceFromFixedHead(stopAtShutValves);
  console.log(
    ` || >> dsOfFixedHeadAllAsset = traceFromFixedHead(stopAtNothing) - Time taken ${
      performance.now() - t1
    }`
  );

  const dsOfFixedHeadIsolationValves = traceFromFixedHead(
    stopAtIsolationValves
  );

  console.log(
    ` || >> dsOfFixedHeadIsolationValves - Time taken ${performance.now() - t1}`
  );

  const dsOfFixedHeadStopAtShutValves = traceFromFixedHead(
    stopAtIsolationValvesAndShutValves
  );

  console.log(
    ` || >> dsOfFixedHeadStopAtShutValves - Time taken ${
      performance.now() - t1
    }`
  );
  //console.log(dsOfFixedHeadStopAtShutValves);

  const downstreamIsolated = diffIsolationAreaInfo(
    dsOfFixedHeadAllAsset,
    addIsolationAreaInfo(
      dsOfFixedHeadIsolationValves,
      oldFunction.isolationArea
    )
  );
  console.log(
    ` || >> downstreamIsolated - Time taken ${performance.now() - t1}`
  );

  const altSupplyAvailable = diffIsolationAreaInfo(
    dsOfFixedHeadAllAsset,
    addIsolationAreaInfo(
      dsOfFixedHeadStopAtShutValves,
      oldFunction.isolationArea,
      downstreamIsolated
    )
  );

  console.log(
    ` || >> altSupplyAvailable - Time taken ${performance.now() - t1}`
  );

  const altSupplyValvesIds = getAltSupplyValves(
    altSupplyAvailable,
    dsOfFixedHeadStopAtShutValves,
    connectionlookup,
    idToFeatureLookup
  );

  console.log(
    ` || >> altSupplyValvesIds - Time taken ${performance.now() - t1}`
  );

  //const altSupplyValve: AltSupplyValve[] = [];
  const altSupplyValve: AltSupplyValve[] = altSupplyValvesIds.map((id) => {
    const fullSupply = traceFromFixedHead(createAltSupplySearch(id));
    return {
      id: id.toString(),
      supplies: diffIsolationAreaInfo(
        fullSupply,
        dsOfFixedHeadStopAtShutValves
      ),
    };
  });

  console.log(` || >> altSupplyValve - Time taken ${performance.now() - t1}`);

  const altSupplyValvesAltIds = altSupplyValve.map((v) => {
    //@ts-ignore
    return [
      //@ts-ignore
      featureLookupIdNumber[v.id].properties.id!.toString(),
      //@ts-ignore
      featureLookupIdNumber[v.id].properties.asset_id!.toString(),
    ] as [string, string];
  });

  console.log(" || Finished getShutOffBlockInfo");

  return {
    burstPipe: pipeId,
    brokenValves: [], //nonOperationalValves,
    isolationValves,
    isolationValvesAltIds,
    shutOffBlock: oldFunction.isolationArea,
    downstreamIsolated,
    altSupplyAvailable,
    altSupplyValve,
    altSupplyValvesAltIds,
  };
}

// Todo: this could do with a serious refactor
function getAltSupplyValves(
  altSupplyAvailable: IsolationAreaInfo,
  dsOfFixedHeadStopAtShutValves: IsolationAreaInfo,
  connectionlookup: ConnectedFeatureLookup,
  idToFeatureLookup: IdToFeatureLookup
): number[] {
  let altSupplyValves: number[] = [];

  altSupplyAvailable.nodes.forEach((n) => {
    const nodeId = idToFeatureLookup[n].properties?.id;
    const connectedAssets = connectionlookup[nodeId];
    connectedAssets.forEach((cA) => {
      if (cA.properties && cA.properties.pipe_closed === "1") {
        // Check if valve has a node that is connected to supply
        const valveNodes = connectionlookup[cA.properties.id];

        const isNodeSupplied = valveNodes.some((n) =>
          typeof n.id === "number"
            ? dsOfFixedHeadStopAtShutValves.nodes.includes(n.id)
            : false
        );
        if (isNodeSupplied && typeof cA.id === "number") {
          altSupplyValves.push(cA.id);
          console.log(`Hey we found a valve to open, ${cA.properties.id}`);
        }
      }
    });
  });

  return altSupplyValves;
}

function getShutOffBlock(
  pipeId: string | undefined,
  nonOperationalValves: InoperableValvesLookup,
  connectedFeatureLookup: ConnectedFeatureLookup,
  getIsolationAreaInfo: (visisted: string[]) => IsolationAreaInfo
): { isolationArea: IsolationAreaInfo; isolationValves: string[] } {
  const valveFilter = (
    f: Feature<Geometry | GeometryCollection, Properties>
  ) => {
    return (
      f.properties?.table === "wn_valve" &&
      typeof f.id === "number" &&
      nonOperationalValves[f.id.toString()] !== true
    );
  };

  let visited: string[] = [];

  let visitedAlt: { [id: string]: boolean } = {};

  let isolationValves: string[] = [];
  if (pipeId) {
    DFSUtil(
      pipeId,
      visited,
      visitedAlt,
      isolationValves,
      connectedFeatureLookup,
      valveFilter
    );
  }

  const isolationArea = getIsolationAreaInfo(visited);

  return { isolationArea, isolationValves };
}

function createGetAreaFromFixedHead(
  connectedFeatureLookup: ConnectedFeatureLookup,
  getIsolationAreaInfo: (visisted: string[]) => IsolationAreaInfo,
  supplyAssets: string[]
): (
  stopAt: (f: Feature<Geometry | GeometryCollection, Properties>) => boolean
) => IsolationAreaInfo {
  const getAreaFromFixedHead = (
    stopAt: (f: Feature<Geometry | GeometryCollection, Properties>) => boolean
  ): IsolationAreaInfo => {
    let visited: string[] = [];
    let visitedAlt: { [id: string]: boolean } = {};
    let stoppedAt: string[] = [];

    supplyAssets.forEach((supply) => {
      DFSUtil(
        //"HOWDEN WTW",
        //"Main WTW",
        supply,
        visited,
        visitedAlt,
        stoppedAt,
        connectedFeatureLookup,
        stopAt
      );
    });

    return getIsolationAreaInfo(visited);
  };

  return getAreaFromFixedHead;
}

function DFSUtil(
  id: string,
  visited: string[],
  visitedAlt: { [id: string]: boolean },
  stoppedAt: string[],
  connections: ConnectedFeatureLookup,
  filter: (f: Feature<Geometry | GeometryCollection, Properties>) => boolean
) {
  visited.push(id);
  visitedAlt[id] = true;

  connections[id]
    .filter((f) => !visitedAlt[f.properties?.id])
    .forEach((f) => {
      if (filter(f)) {
        //Adding Stopped valve as visited, will I regret this?
        visited.push(f.properties!.id);
        visitedAlt[f.properties!.id] = true;
        stoppedAt.push(f.properties!.id);
      } else if (f.properties) {
        // We went past a valve, it is inoperable
        if (f.properties?.table === "wn_valve") {
          stoppedAt.push(f.properties!.id);
        }

        DFSUtil(
          f.properties.id,
          visited,
          visitedAlt,
          stoppedAt,
          connections,
          filter
        );
      }
    });
}

interface ConnectedFeatureLookup {
  [id: string]: Feature<Geometry | GeometryCollection, Properties>[];
}

interface FeatureLookup {
  [id: string]: Feature<Geometry | GeometryCollection, Properties>;
}

interface IdToFeatureLookup {
  [id: number]: Feature<Geometry | GeometryCollection, Properties>;
}

function createGetIsolationAreaInfo(
  model: FeatureCollection<Geometry | GeometryCollection, Properties>,
  demands: NodeDemand
): (visited: string[]) => IsolationAreaInfo {
  const featureLookup = model.features.reduce((obj, item) => {
    item.properties && (obj[item.properties.id] = item);
    return obj;
  }, {} as FeatureLookup);

  const getIsolationAreaInfo = (visited: string[]): IsolationAreaInfo => {
    const tableToInteral = {
      wn_node: "nodes",
      wn_fixed_head: "nodes", // TODO Fix!
      wn_reservoir: "nodes", // TODO Fix!
      wn_transfer_node: "nodes", // TODO Fix!
      wn_hydrant: "hydrants",
      wn_pipe: "pipes",
      wn_valve: "valves",
      wn_non_return_valve: "valves", // TODO Fix!
      wn_float_valve: "valves", // TODO Fix!
      wn_meter: "pipes", // TODO Fix!
      wn_pst: "pipes", // TODO Fix!
    } as {
      [id: string]: keyof IsolationAreaInfo;
    };

    const areaInfo = visited.reduce(
      (acc, id) => {
        const table = tableToInteral[featureLookup[id].properties!.table];
        const newId = featureLookup[id].id;
        if (table && demands[id]) {
          demands[id].forEach((d) => acc.customers.push(parseInt(d.reference)));
        }

        try {
          if (newId && typeof newId === "number") {
            acc[table].push(newId);
            return acc;
          }
        } catch (error) {
          console.warn("Error in search");
          debugger;
          //console.error(error);
        }

        return acc;
      },
      {
        pipes: [],
        valves: [],
        hydrants: [],
        nodes: [],
        customers: [],
      } as IsolationAreaInfo
    );

    return areaInfo;
  };

  return getIsolationAreaInfo;
}

// This function returns a look up object that tells you how objects are connected
// If you use a node ID it will return all connected links where flow is possible (Can't go back into a NRV or PRV)
// For a link it is the same, it should return US and DS unless it is a one direction link or closed
function findConnectedFeatures(
  model: FeatureCollection<Geometry | GeometryCollection, Properties>,
  lookup: FeatureLookup
): ConnectedFeatureLookup {
  // We iterate over each link, no node can be disconnected from a link so we will find all objects
  const links = model.features.filter((f) => f.geometry?.type === "LineString");

  return links.reduce((acc, f) => {
    // If the pipe is closed then move to next pipe, no connections

    // Temp disable, will check during DFS
    if (!f.properties) {
      //f.properties?.pipe_closed === "1" ||) {
      return acc;
    }

    // Lookup is object ID and an array of connected IDs
    // The tenary operate is used to create the array or append depending if it exists
    const { us_node_id, ds_node_id, id } = f.properties;

    const us_node = lookup[us_node_id];
    const ds_node = lookup[ds_node_id];

    // All open pipes connected from US Node to Pipe
    acc[us_node_id] = acc[us_node_id]
      ? acc[us_node_id].concat(f)
      : (acc[us_node_id] = [f]);
    // All open pipes connected from Pipe to DS Node
    acc[id] = acc[id] ? acc[id].concat(ds_node) : (acc[id] = [ds_node]);

    //If we have a PRV or NRV then only this direction is possible and move to next
    if (
      f.properties?.mode === "PRV" ||
      f.properties?.table === "wn_non_return_valve"
    ) {
      return acc;
    }

    // Otherwise also add connection from DS Node to Pipe
    acc[ds_node_id] = acc[ds_node_id]
      ? acc[ds_node_id].concat(f)
      : (acc[ds_node_id] = [f]);
    // And Pipe to US Node
    acc[id] = acc[id] ? acc[id].concat(us_node) : (acc[id] = [us_node]);

    return acc;
  }, {} as ConnectedFeatureLookup);
}

function diffIsolationAreaInfo(
  main: IsolationAreaInfo,
  subtract: IsolationAreaInfo
): IsolationAreaInfo {
  return (Object.keys(main) as Array<keyof IsolationAreaInfo>).reduce(
    (acc, k) => {
      acc[k] = difference(main[k], subtract[k]);
      return acc;
    },
    {} as IsolationAreaInfo
  );
}

function addIsolationAreaInfo(
  main: IsolationAreaInfo,
  ...rest: IsolationAreaInfo[]
): IsolationAreaInfo {
  function customizer(
    objValue: number[],
    srcValue: number[]
  ): number[] | undefined {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }

  const dup = {
    ...main,
  };

  return mergeWith(dup, ...rest, customizer);
}
