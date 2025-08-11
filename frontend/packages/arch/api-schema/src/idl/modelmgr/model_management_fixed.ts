import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
/** 模型管理与空间模型配置相关接口 */
export interface ModelParamOption {
  label?: string,
  value?: string,
}
export interface ParamDisplayStyle {
  widget: string,
  label: {
    [key: string | number]: string
  },
}
export interface ModelParameterInput {
  name: string,
  label: {
    [key: string | number]: string
  },
  desc: {
    [key: string | number]: string
  },
  /** int | float | boolean | string */
  type: string,
  min?: string,
  max?: string,
  default_val: {
    [key: string | number]: string
  },
  precision?: number,
  options?: ModelParamOption[],
  style: ParamDisplayStyle,
}
export interface ModelParameterOutput {
  name: string,
  label: {
    [key: string | number]: string
  },
  desc: {
    [key: string | number]: string
  },
  type: string,
  min?: string,
  max?: string,
  default_val: {
    [key: string | number]: string
  },
  precision?: number,
  options?: ModelParamOption[],
  style: ParamDisplayStyle,
}
export interface ModelCapability {
  function_call?: boolean,
  input_modal?: string[],
  input_tokens?: number,
  json_mode?: boolean,
  max_tokens?: number,
  output_modal?: string[],
  output_tokens?: number,
  prefix_caching?: boolean,
  reasoning?: boolean,
  prefill_response?: boolean,
}
/** 新增：连接配置结构体，替代JSON字符串 */
export interface ConnConfig {
  endpoint?: string,
  auth_type?: string,
  api_key?: string,
  headers?: {
    [key: string | number]: string
  },
  extra_params?: {
    [key: string | number]: string
  },
}
/** 新增：自定义配置结构体，替代JSON字符串 */
export interface CustomConfig {
  parameters?: {
    [key: string | number]: string
  },
  settings?: {
    [key: string | number]: string
  },
  features?: string[],
}
export interface ModelMetaInput {
  name: string,
  protocol: string,
  capability: ModelCapability,
  /** 替换JSON字符串 */
  conn_config: ConnConfig,
}
export interface ModelMetaOutput {
  id: string,
  name: string,
  protocol: string,
  capability: ModelCapability,
  /** 替换JSON字符串 */
  conn_config: ConnConfig,
  status: number,
}
export interface ModelDetailInput {
  id: string,
  name: string,
  description?: {
    [key: string | number]: string
  },
  icon_uri?: string,
  icon_url?: string,
  default_parameters?: ModelParameterInput[],
  meta: ModelMetaInput,
}
export interface ModelDetailOutput {
  id: string,
  name: string,
  description?: {
    [key: string | number]: string
  },
  icon_uri?: string,
  icon_url?: string,
  default_parameters?: ModelParameterOutput[],
  meta: ModelMetaOutput,
  created_at: number,
  updated_at: number,
}
/** ==================== 请求和响应结构 ==================== */
export interface CreateModelRequest {
  name: string,
  description?: {
    [key: string | number]: string
  },
  icon_uri?: string,
  icon_url?: string,
  default_parameters?: ModelParameterInput[],
  meta: ModelMetaInput,
}
export interface CreateModelResponse {
  data?: ModelDetailOutput,
  code: number,
  msg: string,
}
export interface GetModelRequest {
  model_id: string
}
export interface GetModelResponse {
  data?: ModelDetailOutput,
  code: number,
  msg: string,
}
export interface ListModelsRequest {
  page_size?: number,
  page_token?: string,
  filter?: string,
  sort_by?: string,
}
export interface ListModelsResponse {
  data?: ModelDetailOutput[],
  next_page_token?: string,
  total_count?: number,
  code: number,
  msg: string,
}
export interface UpdateModelRequest {
  model_id: string,
  name?: string,
  description?: {
    [key: string | number]: string
  },
  icon_uri?: string,
  icon_url?: string,
  default_parameters?: ModelParameterInput[],
  status?: number,
}
export interface UpdateModelResponse {
  data?: ModelDetailOutput,
  code: number,
  msg: string,
}
export interface DeleteModelRequest {
  model_id: string
}
export interface DeleteModelResponse {
  code: number,
  msg: string,
}
/** ==================== 空间模型配置相关 ==================== */
export interface AddModelToSpaceRequest {
  space_id: string,
  model_id: string,
}
export interface AddModelToSpaceResponse {
  code: number,
  msg: string,
}
export interface RemoveModelFromSpaceRequest {
  space_id: string,
  model_id: string,
}
export interface RemoveModelFromSpaceResponse {
  code: number,
  msg: string,
}
export interface UpdateSpaceModelConfigRequest {
  space_id: string,
  model_id: string,
  /** 替换JSON字符串 */
  custom_config: CustomConfig,
}
export interface UpdateSpaceModelConfigResponse {
  code: number,
  msg: string,
}
export interface GetSpaceModelConfigRequest {
  space_id: string,
  model_id: string,
}
export interface GetSpaceModelConfigResponse {
  data?: CustomConfig,
  code: number,
  msg: string,
}
/** 模型管理 - 统一使用 /api/model/* 路径 */
export const CreateModel = /*#__PURE__*/createAPI<CreateModelRequest, CreateModelResponse>({
  "url": "/api/model/create",
  "method": "POST",
  "name": "CreateModel",
  "reqType": "CreateModelRequest",
  "reqMapping": {
    "body": ["name", "description", "icon_uri", "icon_url", "default_parameters", "meta"]
  },
  "resType": "CreateModelResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const GetModel = /*#__PURE__*/createAPI<GetModelRequest, GetModelResponse>({
  "url": "/api/model/detail",
  "method": "POST",
  "name": "GetModel",
  "reqType": "GetModelRequest",
  "reqMapping": {
    "body": ["model_id"]
  },
  "resType": "GetModelResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const ListModels = /*#__PURE__*/createAPI<ListModelsRequest, ListModelsResponse>({
  "url": "/api/model/list",
  "method": "POST",
  "name": "ListModels",
  "reqType": "ListModelsRequest",
  "reqMapping": {
    "body": ["page_size", "page_token", "filter", "sort_by"]
  },
  "resType": "ListModelsResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const UpdateModel = /*#__PURE__*/createAPI<UpdateModelRequest, UpdateModelResponse>({
  "url": "/api/model/update",
  "method": "POST",
  "name": "UpdateModel",
  "reqType": "UpdateModelRequest",
  "reqMapping": {
    "body": ["model_id", "name", "description", "icon_uri", "icon_url", "default_parameters", "status"]
  },
  "resType": "UpdateModelResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const DeleteModel = /*#__PURE__*/createAPI<DeleteModelRequest, DeleteModelResponse>({
  "url": "/api/model/delete",
  "method": "POST",
  "name": "DeleteModel",
  "reqType": "DeleteModelRequest",
  "reqMapping": {
    "body": ["model_id"]
  },
  "resType": "DeleteModelResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
/** 空间模型配置 - 统一使用 /api/model/space/* 路径 */
export const AddModelToSpace = /*#__PURE__*/createAPI<AddModelToSpaceRequest, AddModelToSpaceResponse>({
  "url": "/api/model/space/add",
  "method": "POST",
  "name": "AddModelToSpace",
  "reqType": "AddModelToSpaceRequest",
  "reqMapping": {
    "body": ["space_id", "model_id"]
  },
  "resType": "AddModelToSpaceResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const RemoveModelFromSpace = /*#__PURE__*/createAPI<RemoveModelFromSpaceRequest, RemoveModelFromSpaceResponse>({
  "url": "/api/model/space/remove",
  "method": "POST",
  "name": "RemoveModelFromSpace",
  "reqType": "RemoveModelFromSpaceRequest",
  "reqMapping": {
    "body": ["space_id", "model_id"]
  },
  "resType": "RemoveModelFromSpaceResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const UpdateSpaceModelConfig = /*#__PURE__*/createAPI<UpdateSpaceModelConfigRequest, UpdateSpaceModelConfigResponse>({
  "url": "/api/model/space/config/update",
  "method": "POST",
  "name": "UpdateSpaceModelConfig",
  "reqType": "UpdateSpaceModelConfigRequest",
  "reqMapping": {
    "body": ["space_id", "model_id", "custom_config"]
  },
  "resType": "UpdateSpaceModelConfigResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});
export const GetSpaceModelConfig = /*#__PURE__*/createAPI<GetSpaceModelConfigRequest, GetSpaceModelConfigResponse>({
  "url": "/api/model/space/config/get",
  "method": "POST",
  "name": "GetSpaceModelConfig",
  "reqType": "GetSpaceModelConfigRequest",
  "reqMapping": {
    "body": ["space_id", "model_id"]
  },
  "resType": "GetSpaceModelConfigResponse",
  "schemaRoot": "api://schemas/idl_modelmgr_model_management_fixed",
  "service": "modelmgr"
});