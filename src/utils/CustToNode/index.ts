import ModelFeatureCollection from "../../interfaces/ModelFeatureCollection";

export interface CustToNode {
  [name: string]: string;
}

export function getCustToNodeLookup(model: ModelFeatureCollection): CustToNode {
  const newLookup: CustToNode = {};

  Object.keys(model.model.demands).forEach((f) => {
    model.model.demands[f].forEach((d) => {
      newLookup[d.reference] = f;
    });
  });
  return newLookup;
}
