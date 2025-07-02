/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** 聚合方式 */
export enum AggregateType {
  Unknown = 1,
  Avg = 2,
  P50 = 3,
  P90 = 4,
  P99 = 5,
  Max = 6,
  Min = 7,
  Sum = 8,
}

/** 降采样间隔 */
export enum DownsampleInterval {
  Unknown = 1,
  /** 30 second */
  DI30S = 2,
  /** 1 minute */
  DI1M = 3,
  /** 2 minute */
  DI2M = 4,
  /** 5 minute */
  DI5M = 5,
  /** 10 minute */
  DI10M = 6,
  /** 20 minute */
  DI20M = 7,
  /** 30 minute */
  DI30M = 8,
}
/* eslint-enable */
