/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** tpm火山操作记录聚合领域结构体 * */
export enum TpmExpansionStatus {
  OrderSuccess = 0,
  UpdateTpmThresholdSuccess = 1,
  UpdateTpmThresholdFailed = 2,
}

export enum TpmOperateStatus {
  UnKnown = 0,
  Success = 1,
  Failed = 2,
}

export enum TpmVolcaOperateType {
  UnKnown = 0,
  VolcaPush = 1,
  VolcaCallBack = 2,
}

export enum TpmVolcaPushType {
  Input = 1,
  Output = 2,
}
/* eslint-enable */
