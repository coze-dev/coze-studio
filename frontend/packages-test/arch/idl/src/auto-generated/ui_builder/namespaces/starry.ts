/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface IApp {
  appId?: string;
  typeId?: string;
  name?: string;
  devSandbox?: string;
  projectId?: string;
  spaceId?: string;
  iconUrl?: string;
  globalSettings?: string;
  exts?: string;
  updater?: string;
  creator?: string;
  updatedAt?: string;
  createdAt?: string;
  _id?: string;
}

export interface IBlockInfo {
  exportName: string;
  pkgName: string;
}

export interface IPackageVersionInfo {
  version: string;
  pkgName: string;
}

export interface ISandbox {
  sandboxId?: string;
  appId?: string;
  name?: string;
  pages?: Array<string>;
  routes?: string;
  crdtHistory?: string;
  exts?: string;
  __meta__?: string;
  blocksMap?: Record<string, IBlockInfo>;
  versionsMap?: Record<string, Record<string, IPackageVersionInfo>>;
  branchInfo?: Record<string, string>;
  updater?: string;
  creator?: string;
  updatedAt?: string;
  createdAt?: string;
  _id?: string;
}
/* eslint-enable */
