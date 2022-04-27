import { expose } from "comlink";
import runEpanet from "./runEpanet";

export type RunEpanetWorkerType = typeof runEpanet;

expose(runEpanet);
