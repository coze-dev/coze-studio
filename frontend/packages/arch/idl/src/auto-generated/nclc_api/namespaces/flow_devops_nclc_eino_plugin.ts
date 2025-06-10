/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export enum Platform {
  UnKnown = 0,
  Goland = 1,
  VsCode = 2,
}

export interface EinoDevopsVersion {
  min?: string;
  max?: string;
  exclude?: Array<string>;
}

export interface EinoToolSourceRequest {
  arch?: string;
  system?: string;
  plugin_version?: string;
  platform?: Platform;
  Host?: string;
  base?: base.Base;
}

export interface EinoToolSourceResponse {
  download_url?: string;
  base_resp?: base.BaseResp;
}

export interface EinoToolsVersionRequest {
  platform?: Platform;
  plugin_version?: string;
  base?: base.Base;
}

export interface EinoToolsVersionResponse {
  platform?: Platform;
  eino_tool_version?: string;
  eino_devops_version?: EinoDevopsVersion;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
