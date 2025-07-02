/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum FieldFilterType {
  Unknown = 1,
  /** Equals (=) */
  Eq = 2,
  /** Greater Than or Equal (>=) */
  Gte = 3,
  /** Less Than or Equal (<=) */
  Lte = 4,
  /** Contains All */
  Containsall = 5,
  /** In */
  In = 6,
  /** Not In */
  NotIn = 7,
}

export enum OrderType {
  Unknown = 1,
  Desc = 2,
}

/** ValueType is used to represent any type of attribute value. */
export enum ValueType {
  Unknown = 1,
  Bool = 2,
  I32 = 3,
  I64 = 4,
  F64 = 5,
  String = 6,
}

export interface FieldOptions {
  i32?: Array<number>;
  i64?: Array<string>;
  f64?: Array<number>;
  string?: Array<string>;
}
/* eslint-enable */
