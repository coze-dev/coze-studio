/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ResourceType {
  Undefined = 0,
  Space = 1,
  Prompt = 2,
  Application = 3,
  Evaluation = 4,
  Trace = 5,
  Agent = 6,
}

/** 密级标签 */
export enum SecurityLevel {
  Undefined = 0,
  L1 = 1,
  L2 = 2,
  L3 = 3,
  L4 = 4,
}

export interface Resource {
  resourceType?: ResourceType;
  resourceID?: string;
  spaceID?: Int64;
  securityLevel?: SecurityLevel;
  ownerIDs?: Array<string>;
}

export interface ResourceIdentifier {
  resourceType?: ResourceType;
  resourceID?: string;
}
/* eslint-enable */
