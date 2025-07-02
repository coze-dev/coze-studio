/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum FactoryType {
  /** func(config) impl */
  Simple = 0,
  /** func(ctx, config) (impl, err) */
  Common = 1,
}

export enum Kind {
  /** 与 golang 的 reflect.Kind 并不是完全对应的，不能依赖 value 直接转换 */
  Invalid = 0,
  String = 1,
  Bool = 2,
  Array = 3,
  Struct = 4,
  Map = 5,
  Interface = 6,
  Int = 7,
  Int64 = 8,
  Int32 = 9,
  Int16 = 10,
  Int8 = 11,
  UInt = 12,
  Uint64 = 13,
  Uint32 = 14,
  Uint16 = 15,
  Uint8 = 16,
  Float64 = 17,
  Float32 = 18,
  Ptr = 19,
}

export enum Source {
  FirstParty = 0,
  Custom = 1,
}
/* eslint-enable */
