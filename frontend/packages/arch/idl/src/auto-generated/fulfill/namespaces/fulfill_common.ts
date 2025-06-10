/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum FulfillmentStatus {
  Unknown = 0,
  /** 初始化 */
  Init = 1,
  /** 运行中 */
  Running = 2,
  /** 待重试 */
  ToRetry = 3,
  /** 已成功 */
  Succeed = 4,
  /** 已失败 */
  Failed = 5,
}

export enum FulfillmentType {
  /** 未知 */
  Unknown = 0,
  /** 增加实体的可调用量 */
  AddEntityAmount = 1,
  /** 用于发送协议支付请求，接收协议支付回调 */
  AutoChargePayment = 2,
  /** 协议支付回调 */
  AutoChargeCallback = 3,
  /** 增加 message credits */
  AddMessageCredits = 4,
}

export enum SourceType {
  /** 未知 */
  Unknown = 0,
  /** bot 运营平台,  */
  BotOperationPlatform = 1,
  /** 支付系统 */
  Trade = 2,
  /** 内部调用 */
  Inner = 3,
}
/* eslint-enable */
