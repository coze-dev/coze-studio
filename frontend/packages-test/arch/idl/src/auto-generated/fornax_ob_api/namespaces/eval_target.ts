/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum CozeBotInfoType {
  /** 草稿 bot */
  DraftBot = 1,
  /** 商店 bot */
  ProductBot = 2,
}

export enum EvalTargetRunStatus {
  Unknown = 0,
  Success = 1,
  Fail = 2,
}

export enum EvalTargetType {
  /** CozeBot */
  CozeBot = 1,
  /** Prompt */
  FornaxPrompt = 2,
}

export enum ModelPlatform {
  Unknown = 0,
  GPTOpenAPI = 1,
  MAAS = 2,
}

export enum SubmitStatus {
  Undefined = 0,
  /** 未提交 */
  UnSubmit = 1,
  /** 已提交 */
  Submitted = 2,
}
/* eslint-enable */
