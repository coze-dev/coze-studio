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
/* eslint-enable */
