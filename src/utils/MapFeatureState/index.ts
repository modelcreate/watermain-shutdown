import { Map } from "mapbox-gl";
import { ShutOffBlockInfo, IsolationAreaInfo } from "../Trace";
import { FeatureCollection, Geometries, Properties } from "@turf/helpers";
import { NetworkIssueSummary } from "../../context/EpanetContext";

export function assignMapFeatureState(
  geoValves: FeatureCollection<Geometries, Properties>,
  isolationArea: ShutOffBlockInfo,
  map: Map,
  custLookup: Object,
  newSupplyAssets: IsolationAreaInfo,
  isolationValveHighlight: string | undefined,
  statHighlight: string | undefined,
  networkIssueSummary: NetworkIssueSummary
): void {
  //@ts-ignore
  const source = map.getSource("isovalves");

  if (source && source.type === "geojson") {
    //@ts-ignore
    source.setData(geoValves);
  }

  clearExistingFeatureStates(map);

  //shutOffBlock
  //downstreamIsolated
  //altSupplyAvailable
  const keys = ["shutOffBlock", "downstreamIsolated", "altSupplyAvailable"] as (
    | "shutOffBlock"
    | "downstreamIsolated"
    | "altSupplyAvailable"
  )[];
  const t1 = performance.now();
  keys.forEach((key) => {
    isolationArea[key].pipes.forEach((id) => {
      if (newSupplyAssets.pipes.includes(id)) {
        return;
      }
      map.setFeatureState(
        {
          source: "mains",
          id,
        },
        { isolated: key }
      );
    });

    isolationArea[key].customers.forEach((id) => {
      if (newSupplyAssets.customers.includes(id)) {
        return;
      }
      map.setFeatureState(
        {
          source: "cust_allocation",
          id,
        },
        { isolated: key }
      );
      map.setFeatureState(
        {
          source: "buildings",
          //@ts-ignore
          id: custLookup[id.toString()],
        },
        { isolated: key }
      );
    });

    isolationArea[key].valves.forEach((id) => {
      if (newSupplyAssets.valves.includes(id)) {
        return;
      }
      map.setFeatureState(
        {
          source: "valves",
          id,
        },
        { isolated: key }
      );
    });

    isolationArea[key].hydrants.forEach((id) => {
      if (newSupplyAssets.hydrants.includes(id)) {
        return;
      }
      map.setFeatureState(
        {
          source: "hydrants",
          id,
        },
        { isolated: true }
      );
    });
    console.log(
      `Send setFeatureState First - Time taken ${performance.now() - t1}`
    );
  });

  if (isolationValveHighlight) {
    setIsolatonValveHighlight(
      isolationArea,
      map,
      custLookup,
      newSupplyAssets,
      isolationValveHighlight
    );
  }

  console.log(`Test statHighlight: ${statHighlight}`);
  if (statHighlight) {
    switch (statHighlight) {
      case "below15":
        setCustomerStatHighlight(networkIssueSummary.below15, map, custLookup);
        break;
      case "reducedBy10":
        setCustomerStatHighlight(
          networkIssueSummary.reducedBy10,
          map,
          custLookup
        );
        break;
      case "increasedBy10":
        setCustomerStatHighlight(
          networkIssueSummary.increasedBy10,
          map,
          custLookup
        );
        break;
      case "highVelocity":
        setPipeStatHighlight(networkIssueSummary.highVelocity, map);
        break;
      case "flowReversals":
        setPipeStatHighlight(networkIssueSummary.flowReversals, map);
        break;

      default:
        break;
    }
  }
}

function setPipeStatHighlight(pipeIds: string[], map: Map): void {
  pipeIds.forEach((id) => {
    map.setFeatureState(
      {
        source: "mains",
        //@ts-ignore
        id,
      },
      { isolated: "shutOffBlock" }
    );
  });
}

function setCustomerStatHighlight(
  custIds: string[],
  map: Map,
  custLookup: Object
): void {
  custIds.forEach((id) => {
    //@ts-ignore
    if (id && custLookup[id.toString()]) {
      map.setFeatureState(
        {
          source: "buildings",
          //@ts-ignore
          id: custLookup[id.toString()],
        },
        { isolated: "newSupply" }
      );
    }
  });
}

function setIsolatonValveHighlight(
  isolationArea: ShutOffBlockInfo,
  map: Map,
  custLookup: Object,
  newSupplyAssets: IsolationAreaInfo,
  isolationValveHighlight: string
): void {
  const t1 = performance.now();
  const altSupplyValves = isolationArea.altSupplyValve.map((v) => {
    return v.id;
  });

  map.removeFeatureState({
    source: "isovalves",
  });
  map.setFeatureState(
    {
      source: "isovalves",
      id: isolationValveHighlight,
    },
    { highlighted: true }
  );

  isolationArea.altSupplyAvailable.pipes.forEach((id) => {
    if (newSupplyAssets && newSupplyAssets.pipes.includes(id)) {
      map.removeFeatureState({
        source: "mains",
        id,
      });
      return;
    }
    map.setFeatureState(
      {
        source: "mains",
        id,
      },
      { isolated: "altSupplyAvailable" }
    );
  });

  isolationArea.altSupplyAvailable.customers.forEach((id) => {
    if (newSupplyAssets && newSupplyAssets.customers.includes(id)) {
      map.removeFeatureState({
        source: "buildings",
        //@ts-ignore
        id: custLookup[id.toString()],
      });
      return;
    }
    map.setFeatureState(
      {
        source: "buildings",
        //@ts-ignore
        id: custLookup[id.toString()],
      },
      { isolated: "altSupplyAvailable" }
    );
  });

  if (altSupplyValves.includes(isolationValveHighlight)) {
    isolationArea.altSupplyValve.forEach((altArea) => {
      if (altArea.id === isolationValveHighlight) {
        // HighLight
        altArea.supplies.pipes.forEach((id) => {
          map.setFeatureState(
            {
              source: "mains",
              id,
            },
            { isolated: "newSupply" }
          );
        });
        altArea.supplies.customers.forEach((id) => {
          map.setFeatureState(
            {
              source: "buildings",
              //@ts-ignore
              id: custLookup[id.toString()],
            },
            { isolated: "newSupply" }
          );
        });
      }
    });
  }

  console.log(
    `Send setFeatureState Second - Time taken ${performance.now() - t1}`
  );
}

function clearExistingFeatureStates(map: Map): void {
  map.removeFeatureState({
    source: "mains",
  });
  map.removeFeatureState({
    source: "hydrants",
  });

  map.removeFeatureState({
    source: "cust_allocation",
  });

  map.removeFeatureState({
    source: "valves",
  });

  map.removeFeatureState({
    source: "buildings",
  });
  map.removeFeatureState({
    source: "isovalves",
  });
}
