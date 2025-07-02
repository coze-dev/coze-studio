/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ObjectType {
  Prompt = 1,
  Plugin = 2,
}

export enum Region {
  Unknown = 0,
  BOE = 1,
  BOEi18n = 2,
  CN = 3,
  I18N = 4,
}

export enum ReleaseType {
  Normal = 1,
  Gray = 2,
}

export interface ObjectRelease {
  object_id: Int64;
  object_type: ObjectType;
  version: string;
  space_id: Int64;
  region?: Region;
  env?: string;
  release_type?: ReleaseType;
  snapshot?: string;
}
/* eslint-enable */
