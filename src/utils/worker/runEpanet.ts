import {
  Project,
  Workspace,
  readBinary,
  LinkProperty,
  EpanetResults,
} from "epanet-js";

import { ShutOffBlockInfo } from "../../utils/Trace";

//const runEpanet = (inpFile: string): EpanetResults => {
function runEpanet(
  inpFile: string,
  shutValves?: [string, string][],
  openValves?: string[],
  isolatedNodeModelId?: string[]
) {
  // Initialise a new Workspace and Project object
  const ws = new Workspace();
  const model = new Project(ws);

  // Write a copy of the inp file to the workspace
  ws.writeFile("net1.inp", inpFile);

  // Runs toolkit methods: EN_open, EN_solveH & EN_close
  model.open("net1.inp", "report.rpt", "out.bin");

  //Close valves if shut valves sent
  if (shutValves) {
    shutValves.forEach((v) => {
      const valveId = v[0];
      const id = model.getLinkIndex(valveId);
      console.log(`Shutting valve ${id} which is ${valveId}`);
      model.setLinkValue(id, LinkProperty.InitStatus, 0);
    });
  }

  //Open valves
  if (openValves) {
    openValves.forEach((v) => {
      const valveId = v;
      const id = model.getLinkIndex(valveId);
      console.log(`Openning valve ${id} which is ${valveId}`);
      model.setLinkValue(id, LinkProperty.InitStatus, 1);
      model.setLinkValue(id, LinkProperty.Setting, 0.01);
    });
  }

  // Remove demands
  if (isolatedNodeModelId) {
    isolatedNodeModelId.forEach((v) => {
      const id = model.getNodeIndex(v);

      for (let index = model.getNumberOfDemands(id); index > 0; index--) {
        model.deleteDemand(id, index);
      }
    });
  }

  model.saveInpFile("Output.inp");
  //console.log(ws.readFile("Output.inp", "utf8"));

  model.solveH();
  model.saveH();
  model.close();

  const results = readBinary(ws.readFile("out.bin", "binary"));

  return results;
}

export default runEpanet;
