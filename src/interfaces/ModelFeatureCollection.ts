import { FeatureCollection, Geometries, Properties } from "@turf/helpers";

export interface LiveData {
  live_data_point_id: string;
  pressure_offset: string;
  time_offset: string;
  pressure_factor: number;
  flow_factor: number;
  flow_offset: number;
  channel_type: string;
  sensor_level: number;
}

export interface LiveDataRaw extends LiveData {
  live_data: {
    date: string;
    time: string;
    interval: string;
    time_unit: string;
    row_count: string;
    values: number[];
  };
}

export interface SensorData {
  [id: string]: number[];
}

export interface ModelLiveData {
  liveDataPoints: LiveDataPoint[];
  sensorData: SensorData;
}

export interface LiveDataPoint {
  nodeId: string;
  liveDataId: string;
  epanetId: number;
}

interface RunTimeSettings {
  start_date_time: string;
}

export default interface ModelFeatureCollection
  extends FeatureCollection<Geometries, Properties> {
  crs: {
    properties: {
      proj4: string;
    };
  };
  model: {
    demands: NodeDemand;
    live_data: {
      [id: string]: LiveDataRaw;
    };
    demand_profiles: {
      [name: string]: number[];
    };
    //timesteps: string[];
    run_time: RunTimeSettings;
    [name: string]: any;
  };
}

export interface NodeDemand {
  [name: string]: Demand[];
}

export interface Demand {
  category_id: string;
  spec_consumption: number;
  no_of_properties: number;
  reference: string;
  z: number;
  x: number;
  y: number;
  connection_point_x: number;
  connection_point_y: number;
}
