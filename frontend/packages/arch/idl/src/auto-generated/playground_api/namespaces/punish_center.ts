/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum CozePunishTaskStatus {
  Success = 0,
  Fail = 1,
}

export interface CozePunishRequest {
  /** 处罚措施id，通过这个id来选择执行哪个处罚 */
  PunishMeasureID: Int64;
  /** 处罚对象id列表 */
  ObjectIDs: Array<string>;
  /** 处罚人uid */
  OperatorUID?: Int64;
  /** 处罚人邮箱 */
  OperatorEmail?: string;
  /** 处罚源 */
  Source?: string;
  /** 处罚持续时间 */
  Duration?: Int64;
  /** 处罚原因 */
  Remark?: string;
}

export interface CozePunishResponse {
  /** 处罚系统无法感知和校验处罚对象id，需要接入方返回处罚结果
key:对象id；value:处罚结果 */
  PunishResultMap: Record<string, CozePunishTaskResult>;
}

export interface CozePunishTaskResult {
  status: CozePunishTaskStatus;
}

export interface CozeUnPunishRequest {
  PunishMeasureID: Int64;
  ObjectIDs: Array<string>;
  OperatorUID?: Int64;
  OperatorEmail?: string;
  Source?: string;
  Remark?: string;
}

export interface CozeUnPunishResponse {
  UnPunishResultMap: Record<string, CozePunishTaskResult>;
}
/* eslint-enable */
