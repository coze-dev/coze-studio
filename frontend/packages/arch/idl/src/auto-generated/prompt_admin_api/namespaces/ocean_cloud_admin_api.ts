/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as model_manage from './model_manage';
import * as copilot_common from './copilot_common';
import * as copilot from './copilot';

export type Int64 = string | number;

export enum BussinessType {
  /** 模型配置 */
  model_config = 1,
  /** chain任务配置 */
  chain_info = 2,
}

export enum DeployStatusEnum {
  /** 成功 */
  Success = 1,
  /** 发布中 */
  Onlining = 2,
  /** 审批中 */
  Approving = 3,
  /** 失败 */
  Failed = 4,
}

export enum EnumType {
  /** 模型版本 */
  model_version = 1,
  /** 模型家族 */
  model_family = 2,
  /** 模型的场景 */
  model_scene = 3,
  /** 模型执行代理 */
  model_proxy = 4,
  /** 模型图标路径 */
  model_icon_path = 5,
}

export interface ApplyRoleData {
  /** role 名称 */
  role_name?: string;
  /** role 能力的描述 */
  role_desc?: string;
  /** role 的申请链接 */
  role_apply_url?: string;
  /** role kani key */
  role_key?: string;
  /** 是否已拥有该角色, 当用户已有的话可以将它相关的信息置灰让用户不可选 */
  has_role?: boolean;
}

export interface BindSceneModelData {
  model_list?: Array<ModelData>;
  redirect_uri?: string;
}

export interface CasLoginReq {
  callback?: string;
}

export interface CasLoginResp {}

export interface CommonEnumData {
  /** key 是对应的 id,  值是 id 的中文描述 */
  enum_data?: Array<EnumData>;
  redirect_uri?: string;
}

export interface CreateChainInfoDeploymentRequest {
  Operator: string;
  TaskId: Int64;
  TaskName: string;
  OldVersion: Int64;
  NewVersion: Int64;
  Cookie: string;
  FromOversea?: boolean;
  AppOwner?: string;
}

export interface CreateChainInfoDeploymentResponse {
  code?: number;
  msg?: string;
  url: string;
}

export interface CreateModelDeploymentRequest {
  Operator: string;
  ModelId: Int64;
  ModelName?: string;
  OldModelMetas?: Array<model_manage.ModelRuleTarget>;
  NewModelMetas?: Array<model_manage.ModelRuleTarget>;
}

export interface CreateModelDeploymentResponse {
  code?: number;
  msg?: string;
  url: string;
}

export interface CreateModelEntityData {
  /** 模型的 ID */
  model_id: Int64;
  redirect_uri?: string;
}

export interface CreateModelEntityReq {
  /** 大模型名称 model_arch */
  model_name: string;
  Referer?: string;
  /** 模型分流 */
  targets: Array<model_manage.ModelRuleTarget>;
  'Ocean-Jwt-Token'?: string;
}

export interface CreateModelEntityResp {
  code?: number;
  msg?: string;
  data: CreateModelEntityData;
}

export interface CreateModelMetaData {
  /** 模型的 ID */
  model_id: Int64;
  redirect_uri?: string;
}

export interface CreateModelMetaReq {
  /** 大模型名称 model_arch */
  model_name: string;
  /** 大模型所在的分类 */
  family: copilot_common.ModelFamily;
  Referer?: string;
  /** 大模型对应的版本(目前只适用 GPT) */
  version?: copilot_common.ModelVersion;
  /** 模型的描述, 最小5字节，最大2048 */
  desc: string;
  show_name?: string;
  icon?: string;
  /** 模型能力描述 */
  capability?: copilot.Capability;
  /** 模型容量限制 */
  quota?: copilot.ModelQuota;
  /** 模型的超时和重试次数等配置 */
  model_config?: copilot.ModelConf;
  /** 模型模板配置 */
  prompt_conf?: copilot.PromptConf;
  /** 历史兼容字段 */
  legacy_fields?: copilot.LegacyFields;
  /** 模型参数 */
  parameters?: Array<copilot.ModelParameter>;
  display_properties?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface CreateModelMetaResp {
  code?: number;
  msg?: string;
  data: CreateModelMetaData;
}

export interface CreateModelWithSceneData {
  SceneIDMap?: Record<copilot_common.ModelListScene, Int64>;
  redirect_uri?: string;
}

export interface CreateModelWithSceneReq {
  /** 场景 ID */
  scene: Array<copilot_common.ModelListScene>;
  /** 模型 ID */
  model_id: string;
  Referer?: string;
  /** 展示名称(后续如果需要支持 i18n 的话扩展一个 Starling 字段) */
  show_name: string;
  /** 排序 */
  ranking: number;
  /** 图标，优先级会覆盖 model_meta 下的 icon_url */
  icon?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface CreateModelWithSceneResp {
  code?: number;
  msg?: string;
  data: CreateModelWithSceneData;
}

export interface DeleteModelMetaData {
  redirect_uri?: string;
}

export interface DeleteModelMetaReq {
  /** 模型ID */
  model_id?: string;
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface DeleteModelMetaResp {
  code?: number;
  msg?: string;
  data: DeleteModelMetaData;
}

export interface DeleteModelWithSceneData {
  redirect_uri?: string;
}

export interface DeleteModelWithSceneReq {
  scene: copilot_common.ModelListScene;
  model_id: string;
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface DeleteModelWithSceneResp {
  code?: number;
  msg?: string;
  data: DeleteModelWithSceneData;
}

export interface DeploymentDetail {
  Id: string;
  Operator: string;
  BizType: BussinessType;
  Status: DeployStatusEnum;
  Url: string;
  Title: string;
  /** 业务唯一标识，如model id */
  BizId: string;
  Remark?: string;
  extra?: Record<string, string>;
}

export interface EnumData {
  id?: number;
  value?: string;
}

export interface GetBindSceneModelReq {
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetBindSceneModelResp {
  code?: number;
  msg?: string;
  data: BindSceneModelData;
}

export interface GetCommonEnumDataReq {
  /** 枚举值类型 */
  enum_type?: EnumType;
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetCommonEnumDataResp {
  code?: number;
  msg?: string;
  data: CommonEnumData;
}

export interface GeteModelMetaTemplateResp {
  code?: number;
  msg?: string;
  data: ModelMetaTemplateData;
}

export interface GetModelListWithSceneData {
  /** 场景下的模型列表，顺序是按照后台配置的Ranking正序排列 */
  ModelList?: Array<ModelSceneData>;
  redirect_uri?: string;
}

export interface GetModelListWithSceneReq {
  scene: copilot_common.ModelListScene;
  /** 是否需要被删除的 model */
  has_delete_model?: boolean;
  Referer?: string;
  /** 根据 model_name 模糊查找 */
  model_name?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetModelListWithSceneResp {
  code?: number;
  msg?: string;
  data: GetModelListWithSceneData;
}

export interface GetModelMetaListData {
  model_list?: Array<ModelData>;
  next_cursor?: Int64;
  total?: Int64;
  redirect_uri?: string;
}

export interface GetModelMetaListReq {
  /** 模型ID, 不传就拉全量 */
  model_id?: string;
  Referer?: string;
  /** 指定的状态，不传默认是所有的状态都获取(包括删除) */
  status?: Array<copilot_common.ModelStatus>;
  /** 根据 model_name 模糊查找 */
  model_name?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetModelMetaListResp {
  code?: number;
  msg?: string;
  data: GetModelMetaListData;
}

export interface GetModelMetaTemplateReq {
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetRoleListForModelData {
  role_data?: Array<ApplyRoleData>;
  redirect_uri?: string;
}

export interface GetRoleListForModelReq {
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface GetRoleListForModelResp {
  code?: number;
  msg?: string;
  data: GetRoleListForModelData;
}

/** 使用api.http_code来注解http_code，使用http_message来注解返回的message
 https://bytedance.larkoffice.com/wiki/wikcncmO7hvkPf3D0c83sjgrtkf */
export interface HttpRequestParams {
  Referer?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface ModelData {
  /** 模型 ID */
  model_id?: string;
  /** 大模型名称 model_arch */
  model_name?: string;
  /** 大模型所在的分类 */
  family?: copilot_common.ModelFamily;
  /** 大模型对应的版本(目前只适用 GPT) */
  version?: copilot_common.ModelVersion;
  /** 描述 */
  desc?: string;
  /** 模型能力描述 */
  capability?: copilot.Capability;
  /** 模型容量限制 */
  quota?: copilot.ModelQuota;
  /** 模型的超时和重试次数等配置 */
  model_config?: copilot.ModelConf;
  prompt_conf?: copilot.PromptConf;
  /** 历史兼容字段 */
  legacy_fields?: copilot.LegacyFields;
  /** 状态 1 使用中 10 删除 */
  status?: copilot_common.ModelStatus;
  /** family 对应的名称,前端拿到后直接展示 */
  family_name?: string;
  show_name?: string;
  icon_url?: string;
  icon?: string;
  /** 通过场景获取时，会返回排序 */
  ranking?: number;
  /** 模型参数 */
  parameters?: Array<copilot.ModelParameter>;
  display_properties?: string;
  /** 创建者信息 */
  create_user?: UserInfo;
  /** 更新信息 */
  update_user?: UserInfo;
  create_at_unix?: Int64;
  update_at_unix?: Int64;
}

export interface ModelMetaTemplateData {
  /** 大模型名称  model_arch */
  model_name?: string;
  family?: copilot_common.ModelFamily;
  version?: copilot_common.ModelVersion;
  desc?: string;
  show_name?: string;
  icon_url?: string;
  capability?: copilot.Capability;
  quota?: copilot.ModelQuota;
  model_config?: copilot.ModelConf;
  prompt_conf?: copilot.PromptConf;
  legacy_fields?: copilot.LegacyFields;
  /** 模型参数 */
  parameters?: Array<copilot.ModelParameter>;
  display_properties?: string;
  redirect_uri?: string;
}

export interface ModelQueryRequest {
  /** 模型ID, 不传就拉全量 */
  ModelIds?: Array<string>;
  Referer?: string;
  Scene?: copilot_common.ModelListScene;
  /** 指定的状态，不传默认是所有的状态都获取(包括删除) */
  Status?: Array<copilot_common.ModelStatus>;
  /** 模糊匹配 ModelName */
  ModelName?: string;
  'Ocean-Jwt-Token'?: string;
  Cursor?: Int64;
  Size?: Int64;
}

export interface ModelSceneData {
  /** 场景 id */
  scene?: copilot_common.ModelListScene;
  /** 模型基础信息 */
  model_data: ModelData;
  /** 展示名称 */
  show_name: string;
  /** 图标 */
  icon?: string;
  /** 状态 1 使用中 */
  status?: copilot_common.ModelStatus;
  /** 排序用字段，ranking 越大越前 */
  ranking?: number;
  /** icon 图标的完整路径 */
  icon_url?: string;
  /** 创建人信息 */
  create_user?: UserInfo;
  /** 最后更新人信息 */
  update_user?: UserInfo;
  /** 创建时间 */
  create_at_unix?: Int64;
  /** 更新时间 */
  update_at_unix?: Int64;
}

export interface QueryDeploymentDetailRequest {
  Id?: string;
  Title?: string;
  Operator?: string;
  Status?: DeployStatusEnum;
  PageNum: Int64;
  PageSize: Int64;
}

export interface QueryDeploymentDetailResponse {
  code?: number;
  msg?: string;
  DeploymentDetails?: Array<DeploymentDetail>;
  Total?: Int64;
}

export interface QueryModelEntityData {
  model_entity_list?: Array<model_manage.ModelEntity>;
  total?: Int64;
}

export interface QueryModelEntityReq {
  /** 模糊匹配 ModelName */
  model_name?: string;
  Referer?: string;
  index?: Int64;
  page_size?: Int64;
  'Ocean-Jwt-Token'?: string;
}

export interface QueryModelEntityResp {
  code?: number;
  msg?: string;
  data: QueryModelEntityData;
}

export interface QueryModelMetaByIdReq {
  MetaId: string;
}

export interface QueryModelMetaByIdResp {
  code?: number;
  msg?: string;
  data?: ModelData;
  yaml_data?: string;
}

export interface QueryModelMetaData {
  model_data_list?: Array<ModelData>;
  total?: Int64;
}

export interface QueryModelMetaReq {
  /** 模糊匹配 ModelName */
  model_name?: string;
  Referer?: string;
  index?: Int64;
  page_size?: Int64;
  'Ocean-Jwt-Token'?: string;
}

export interface QueryModelMetaResp {
  code?: number;
  msg?: string;
  data: QueryModelMetaData;
}

export interface RollBackDeploymentReq {
  build_id?: string;
}

export interface RollBackDeploymentResp {
  code?: number;
  msg?: string;
}

export interface UpdateDeploymentStatusReq {
  BizKey?: string;
  BizType?: BussinessType;
  Status?: DeployStatusEnum;
  DeployId?: Int64;
}

export interface UpdateDeploymentStatusResp {
  code?: number;
  msg?: string;
}

export interface UpdateModelEntityData {
  redirect_uri?: string;
}

export interface UpdateModelEntityReq {
  /** 模型ID */
  model_id?: string;
  /** 模型名称 */
  model_name?: string;
  Referer?: string;
  /** 模型分流 */
  targets?: Array<model_manage.ModelRuleTarget>;
  'Ocean-Jwt-Token'?: string;
}

export interface UpdateModelEntityResp {
  code?: number;
  msg?: string;
  data: UpdateModelEntityData;
  Url?: string;
}

export interface UpdateModelMetaData {
  /** 模型的 ID */
  model_meta_id: Int64;
  redirect_uri?: string;
}

export interface UpdateModelMetaReq {
  /** 模型ID */
  model_id?: string;
  /** 模型名称 */
  model_name?: string;
  Referer?: string;
  /** 大模型所在的分类 */
  family?: copilot_common.ModelFamily;
  /** 大模型对应的版本(目前只适用 GPT) */
  version?: copilot_common.ModelVersion;
  /** 模型的描述, 最小5字节，最大2048 */
  desc?: string;
  show_name?: string;
  icon?: string;
  /** 模型能力描述 */
  capability?: copilot.Capability;
  /** 模型容量限制 */
  quota?: copilot.ModelQuota;
  /** 模型的超时和重试次数等配置 */
  model_config?: copilot.ModelConf;
  /** 模型模板配置 */
  prompt_conf?: copilot.PromptConf;
  /** 历史兼容字段 */
  legacy_fields?: copilot.LegacyFields;
  /** 模型参数 */
  parameters?: Array<copilot.ModelParameter>;
  display_properties?: string;
  'Ocean-Jwt-Token'?: string;
}

export interface UpdateModelMetaResp {
  code?: number;
  msg?: string;
  data: UpdateModelMetaData;
}

export interface UpdateModelWithSceneData {
  redirect_uri?: string;
}

export interface UpdateModelWithSceneReq {
  /** 场景 ID */
  scene: copilot_common.ModelListScene;
  /** 模型 ID, 场景ID+ 模型ID是唯一键 */
  model_id: string;
  Referer?: string;
  /** 展示名称, 最大 128 字符(后续如果需要支持 i18n 的话扩展一个 Starling 字段) */
  show_name?: string;
  /** 图标， 最大 256 字符 */
  icon?: string;
  /** 排序 */
  ranking?: number;
  'Ocean-Jwt-Token'?: string;
}

export interface UpdateModelWithSceneResp {
  code?: number;
  msg?: string;
  data: UpdateModelWithSceneData;
}

export interface UserInfo {
  /** 用户的邮箱前缀 */
  user_name?: string;
}
/* eslint-enable */
