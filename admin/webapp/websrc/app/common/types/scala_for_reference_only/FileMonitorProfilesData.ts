// Generated by ScalaTS 0.5.9: https://scala-ts.github.io/scala-ts/

import { Array, isArray } from './Array';

export interface FileMonitorProfilesData {
  profiles: Array;
}

export function isFileMonitorProfilesData(v: any): v is FileMonitorProfilesData {
  return (
    (v['profiles'] && Array.isArray(v['profiles']))
  );
}