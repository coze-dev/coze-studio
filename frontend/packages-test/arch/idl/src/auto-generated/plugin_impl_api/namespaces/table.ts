/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface ExecuteSqlRequest {
  raw_sql: string;
}

export interface ExecuteSqlResponse {
  code?: number;
  msg?: string;
  data?: string;
}
/* eslint-enable */
