/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum URLType {
  EXTERNAL = 0,
  INTERNAL = 1,
}

export interface ImageURL {
  img: ImageXMeta;
  mainURL: string;
  backupURL?: string;
}

export interface ImageURLInfo {
  status: Int64;
  msg: string;
  urlInfo?: ImageURL;
}

export interface ImageXMeta {
  uri: string;
  tpl: string;
  format?: string;
  query?: Record<string, string>;
}
/* eslint-enable */
