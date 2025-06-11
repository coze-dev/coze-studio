/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum StructureGenDataType {
  Undefined = 0,
  JSON = 1,
}

export enum StructureGenModelType {
  Undefined = 0,
  GPT = 1,
  Skylark = 2,
}

/** StructureGenTaskStatus 自动生成任务状态 */
export enum StructureGenTaskStatus {
  Undefined = 0,
  /** 已完成 */
  Finished = 1,
  /** 等待中 */
  Pending = 2,
  /** 进行中 */
  Running = 3,
  /** 已取消 */
  Canceled = 4,
  /** 失败 */
  Failed = 5,
}

/** StructureGenChoice 生成结果 */
export interface StructureGenChoice {
  /** 生成的数据 */
  content?: string;
  /** 停止生成的原因，如果生成成功则为finish，否则为其他错误信息 */
  stopReason?: string;
  /** 消耗 */
  usage?: StructureGenUsage;
}

/** StructureGenUsage 生成消耗 */
export interface StructureGenUsage {
  /** 输入Tokens */
  inputTokens?: Int64;
  /** 输出Tokens */
  outputTokens?: Int64;
  /** 生成耗时（毫秒） */
  latencyInMs?: Int64;
}
/* eslint-enable */
