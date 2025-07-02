/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum SSEEvent {
  Unknown = 0,
  Start = 1,
  Processing = 2,
  End = 3,
}

export interface Usage {
  InputToken?: Int64;
  OutputToken?: Int64;
}
/* eslint-enable */
