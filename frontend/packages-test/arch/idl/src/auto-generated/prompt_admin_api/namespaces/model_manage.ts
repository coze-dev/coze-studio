/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ModelParamType {
  Float = 1,
  Int = 2,
  Boolean = 3,
  String = 4,
}

export enum ModelProvider {
  GptOpenApi = 1,
  GptEngine = 2,
  MaaS = 3,
  QianFan = 4,
  BytedLLMServer = 5,
}

export interface ModelEntity {
  /** 模型 id */
  ModelID?: string;
  /** 模型名称 */
  ModelName?: string;
  /** 模型分流规则 */
  Targets?: Array<ModelRuleTarget>;
  /** 创建者 */
  CreaterEmail?: string;
  /** 最后修改人 */
  UpdaterEmail?: string;
  /** 模型创建时间 */
  CreateTime?: Int64;
  /** 模型修改时间 */
  UpdateTime?: Int64;
}

export interface ModelRuleTarget {
  /** 要打到的模型元数据ID */
  ModelMetaID?: string;
  /** 要命中的流量比例区间开始 */
  RangeStart?: Int64;
  /** 要命中的流量比例区间结束 */
  RangeEnd?: Int64;
  /** 逗号拼接的要命中的用户名列表 */
  ConnectorUIDs?: Array<string>;
}
/* eslint-enable */
