/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface StreamRequest {
  EventType?: string;
  EventID?: string;
  Data?: Blob;
  Extended?: Record<string, Array<string>>;
}

export interface StreamResponse {
  EventType?: string;
  EventID?: string;
  Data?: Blob;
}
/* eslint-enable */
