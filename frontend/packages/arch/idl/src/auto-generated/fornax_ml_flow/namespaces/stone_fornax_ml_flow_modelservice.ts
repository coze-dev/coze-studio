/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as model from './model';

export type Int64 = string | number;

export interface GetModelFilterParamsRequest {
  /** 因为coze暂时给不了rpc接口，所以后端需要拿到cookie去请求coze的前端接口 */
  cookie?: string;
  base?: base.Base;
}

export interface GetModelFilterParamsResponse {
  modelFilterTags?: Record<model.ModelFilterKey, Array<string>>;
  modelContextRange?: ModelContextRange;
  modelVendors?: Array<string>;
  baseResp?: base.BaseResp;
}

export interface GetModelRequest {
  /** 本期只支持BotEngine(等于llm gateway等于coze) */
  provider?: model.Provider;
  providerModelID?: string;
  spaceID?: Int64;
  /** 因为coze暂时给不了rpc接口，所以后端需要拿到cookie去请求coze的前端接口 */
  cookie?: string;
  base?: base.Base;
}

export interface GetModelResponse {
  model?: model.Model;
  baseResp?: base.BaseResp;
}

export interface GetModelUsageRequest {
  modelIdentification?: string;
  /** 本期只支持llm gateway */
  provider?: model.Provider;
  spaceID?: Int64;
  base?: base.Base;
}

export interface GetModelUsageResponse {
  modelUsages?: Array<ModelUsage>;
  baseResp?: base.BaseResp;
}

export interface ListModelRequest {
  cursorID?: string;
  limit?: number;
  /** 筛选项 */
  filter?: ModelFilter;
  /** coze空间id */
  spaceID?: Int64;
  /** 因为coze暂时给不了rpc接口，所以后端需要拿到cookie去请求coze的前端接口 */
  cookie?: string;
  base?: base.Base;
}

export interface ListModelResponse {
  models?: Array<model.Model>;
  cursorID?: string;
  hasMore?: boolean;
  total?: Int64;
  baseResp?: base.BaseResp;
}

export interface ModelContextRange {
  /** 上限，不传代表不设限 */
  upperBound?: number;
  /** 下限，不传代表不设限 */
  lowerBound?: number;
}

export interface ModelFilter {
  /** 模型tag过滤项，value中list内部各个元素在过滤时是or关系，各个key之间在过滤时是and关系 */
  modelFilterTags?: Record<model.ModelFilterKey, Array<string>>;
  /** 模型状态 */
  modelStatuses?: Array<model.CommercialModelStatus>;
  /** 模型支持的上下文长度的范围 */
  modelContextRange?: ModelContextRange;
  /** 模型厂商 */
  modelVendors?: Array<string>;
  /** 名称关键字 */
  name?: string;
  /** 特殊场景 */
  modelFilterScene?: model.ModelFilterScene;
}

export interface ModelUsage {
  promptInputToken?: Int64;
  promptOutputToken?: Int64;
  evaluationInputToken?: Int64;
  evaluationOutputToken?: Int64;
  date?: string;
}
/* eslint-enable */
