/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GetModelFuncConfigRequest {
  model_id?: string;
}

export interface GetModelFuncConfigResponse {
  model_func_config_list: Array<ModelFuncConfig>;
  code: Int64;
  msg: string;
}

export interface GetModelListRequest {}

export interface GetModelListResponse {
  model_info_list: Array<Model>;
  code: Int64;
  msg: string;
}

export interface Model {
  model_id?: Int64;
  model_name?: string;
  model_icon?: string;
  /** 透传copilot version字段 */
  version?: string;
  token_limit?: Int64;
}

export interface ModelFuncConfig {
  model_id?: Int64;
  func_config?: string;
  connector_white_list?: string;
  create_time?: Int64;
  update_time?: Int64;
  latest_operator_email?: string;
}

export interface UpdateModelFuncConfigRequest {
  /** 已存在model_id即更新，否则创建 */
  model_id: Int64;
  func_config?: string;
  connector_white_list?: string;
}

export interface UpdateModelFuncConfigResponse {
  code: Int64;
  msg: string;
}
/* eslint-enable */
