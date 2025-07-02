/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AuthorizationServiceLocation {
  Header = 1,
  Query = 2,
}

export enum AuthorizationType {
  None = 0,
  Service = 1,
  OAuth = 3,
}

export enum CreationMethod {
  COZE = 0,
  IDE = 1,
}

export enum ParameterLocation {
  Path = 1,
  Query = 2,
  Body = 3,
  Header = 4,
}
/* eslint-enable */
