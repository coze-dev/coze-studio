/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as marketplace_common from './../marketplace_common';
export { marketplace_common };
import * as product_common from './product_common';
export { product_common };
import * as base from './../../../base';
export { base };
import { createAPI } from './../../../../api/config';
export const PublicGetProductList = /*#__PURE__*/ createAPI<
  GetProductListRequest,
  GetProductListResponse
>({
  url: '/api/marketplace/product/list',
  method: 'GET',
  name: 'PublicGetProductList',
  reqType: 'GetProductListRequest',
  reqMapping: {
    body: [
      'entity_type',
      'sort_type',
      'page_num',
      'page_size',
      'keyword',
      'publish_mode',
      'source',
      'current_entity_type',
      'preview_topic_id',
      'is_official',
      'need_extra',
      'entity_types',
      'is_free',
      'plugin_type',
    ],
    query: [
      'category_id',
      'publish_platform_ids',
      'current_entity_id',
      'current_entity_version',
      'topic_id',
    ],
    header: ['Tt-Agw-Client-Ip'],
  },
  resType: 'GetProductListResponse',
  schemaRoot:
    'api://schemas/idl_flow_marketplace_flow_marketplace_product_public_api',
  service: 'explore',
});
export const PublicGetProductDetail = /*#__PURE__*/ createAPI<
  GetProductDetailRequest,
  GetProductDetailResponse
>({
  url: '/api/marketplace/product/detail',
  method: 'GET',
  name: 'PublicGetProductDetail',
  reqType: 'GetProductDetailRequest',
  reqMapping: {
    query: ['product_id', 'entity_id'],
    body: ['entity_type', 'need_audit_failed'],
    header: ['Tt-Agw-Client-Ip'],
  },
  resType: 'GetProductDetailResponse',
  schemaRoot:
    'api://schemas/idl_flow_marketplace_flow_marketplace_product_public_api',
  service: 'explore',
});
export const PublicFavoriteProduct = /*#__PURE__*/ createAPI<
  FavoriteProductRequest,
  FavoriteProductResponse
>({
  url: '/api/marketplace/product/favorite',
  method: 'POST',
  name: 'PublicFavoriteProduct',
  reqType: 'FavoriteProductRequest',
  reqMapping: {
    body: ['product_id', 'entity_type', 'is_cancel', 'entity_id', 'topic_id'],
    header: ['Cookie'],
  },
  resType: 'FavoriteProductResponse',
  schemaRoot:
    'api://schemas/idl_flow_marketplace_flow_marketplace_product_public_api',
  service: 'explore',
});
export const PublicGetUserFavoriteListV2 = /*#__PURE__*/ createAPI<
  GetUserFavoriteListV2Request,
  GetUserFavoriteListV2Response
>({
  url: '/api/marketplace/product/favorite/list.v2',
  method: 'GET',
  name: 'PublicGetUserFavoriteListV2',
  reqType: 'GetUserFavoriteListV2Request',
  reqMapping: {
    query: [
      'cursor_id',
      'page_size',
      'entity_type',
      'sort_type',
      'keyword',
      'source',
      'need_user_trigger_config',
      'begin_at',
      'end_at',
      'entity_types',
      'organization_id',
    ],
  },
  resType: 'GetUserFavoriteListV2Response',
  schemaRoot:
    'api://schemas/idl_flow_marketplace_flow_marketplace_product_public_api',
  service: 'explore',
});
export const PublicDuplicateProduct = /*#__PURE__*/ createAPI<
  DuplicateProductRequest,
  DuplicateProductResponse
>({
  url: '/api/marketplace/product/duplicate',
  method: 'POST',
  name: 'PublicDuplicateProduct',
  reqType: 'DuplicateProductRequest',
  reqMapping: {
    body: ['product_id', 'entity_type', 'space_id', 'name'],
    header: ['Cookie'],
  },
  resType: 'DuplicateProductResponse',
  schemaRoot:
    'api://schemas/idl_flow_marketplace_flow_marketplace_product_public_api',
  service: 'explore',
});
export interface FavoriteProductResponse {
  code: number;
  message: string;
  is_first_favorite?: boolean;
}
export interface FavoriteProductRequest {
  product_id?: string;
  entity_type: product_common.ProductEntityType;
  is_cancel?: boolean;
  entity_id?: string;
  topic_id?: string;
  Cookie?: string;
}
export interface GetProductListRequest {
  entity_type?: product_common.ProductEntityType;
  category_id?: string;
  sort_type: product_common.SortType;
  page_num: number;
  page_size: number;
  /** 不为空则搜索 */
  keyword?: string;
  /** 公开方式：1-开源；2-闭源                                                                                    , // 公开方式 */
  publish_mode?: product_common.ProductPublishMode;
  /** 发布渠道 */
  publish_platform_ids?: string[];
  /** 列表页 tab; 1-运营推荐 */
  source?: product_common.ProductListSource;
  /**
   * 个性化推荐场景, 传入当前的实体信息, 获取推荐的商品
   * 当前实体类型
   */
  current_entity_type?: product_common.ProductEntityType;
  /** 当前实体 ID */
  current_entity_id?: string;
  /** 当前实体版本 */
  current_entity_version?: string;
  /** 专题场景 */
  topic_id?: string;
  preview_topic_id?: string;
  /** 是否需要过滤出官方商品 */
  is_official?: boolean;
  /** 是否需要返回额外信息 */
  need_extra?: boolean;
  /** 商品类型列表, 优先使用该参数，其次使用 EntityType */
  entity_types?: product_common.ProductEntityType[];
  /** true = 筛选免费的；false = 筛选付费的；不传则不区分免费和付费 */
  is_free?: boolean;
  /** 插件类型 */
  plugin_type?: product_common.PluginType;
  'Tt-Agw-Client-Ip'?: string;
}
export interface GetProductListResponse {
  code: number;
  message: string;
  data: GetProductListData;
}
export interface GetProductListData {
  products?: ProductInfo[];
  has_more: boolean;
  total: number;
}
export interface ProductInfo {
  meta_info: ProductMetaInfo;
  user_behavior?: UserBehaviorInfo;
  commercial_setting?: product_common.CommercialSetting;
  plugin_extra?: PluginExtraInfo;
  bot_extra?: BotExtraInfo;
  workflow_extra?: WorkflowExtraInfo;
  social_scene_extra?: SocialSceneExtraInfo;
  project_extra?: ProjectExtraInfo;
}
export interface SellerInfo {
  id: string;
  name: string;
  avatar_url: string;
}
export interface ProductCategory {
  id: string;
  name: string;
  icon_url: string;
  active_icon_url: string;
  index: number;
  count: number;
}
export interface ProductLabel {
  name: string;
}
export interface ProductMetaInfo {
  id: string;
  /** 商品/模板名称 */
  name: string;
  /** 素材 ID，由 entity_type 来决定是 bot/plugin 的ID */
  entity_id: string;
  /** 商品素材类型 */
  entity_type: product_common.ProductEntityType;
  /** 商品/模板头像 */
  icon_url: string;
  /** 热度：模板热度=复制量（用于卡片展示/排序）；商品热度=不同商品有独立的计算逻辑（仅用于排序）—— heat的计算有一定延迟 */
  heat: number;
  favorite_count: number;
  /** 废弃,使用UserInfo代替 */
  seller: SellerInfo;
  /** 商品描述 */
  description: string;
  listed_at: string;
  status: product_common.ProductStatus;
  /** 商品/模板分类信息 */
  category?: ProductCategory;
  /** 是否收藏 */
  is_favorited: boolean;
  is_free: boolean;
  /** 模板介绍/插件介绍（目前是富文本格式） */
  readme: string;
  entity_version?: string;
  labels?: ProductLabel[];
  user_info: product_common.UserInfo;
  medium_icon_url: string;
  origin_icon_url: string;
  /** 模板封面 */
  covers?: product_common.ImageInfo[];
  /** 是否专业版特供 */
  is_professional?: boolean;
  /** 是否为模板 */
  is_template: boolean;
  /** 是否官方商品 */
  is_official: boolean;
  /** 价格，当前只有模板有 */
  price?: marketplace_common.Price;
}
export interface UserBehaviorInfo {
  /**
   * 用户主页需要返回最近浏览/使用商品的时间
   * 最近浏览时间戳
   */
  viewed_at?: string;
  /** 最近使用时间戳 */
  used_at?: string;
}
export enum PluginAuthMode {
  /** 不需要授权 */
  NoAuth = 0,
  /** 需要授权，但无授权配置 */
  Required = 1,
  /** 需要授权，且已经配置 */
  Configured = 2,
  /** 需要授权，但授权配置可能是用户级别，可由用户自己配置 */
  Supported = 3,
}
export interface PluginExtraInfo {
  tools?: PluginToolInfo[];
  total_api_count: number;
  bots_use_count: number;
  /** 是否有隐私声明, 目前只有 PublicGetProductDetail 会取数据 */
  has_private_statement?: boolean;
  /** 隐私声明, 目前只有 PublicGetProductDetail 会取数据 */
  private_statement?: string;
  associated_bots_use_count: number;
  is_premium: boolean;
  is_official: boolean;
  /** 调用量 */
  call_amount?: number;
  /** 成功率 */
  success_rate?: number;
  /** 平均执行时长 */
  avg_exec_time?: number;
  is_default_icon?: boolean;
  space_id?: string;
  material_id?: string;
  connectors: PluginConnectorInfo[];
  plugin_type?: product_common.PluginType;
  /** for opencoze */
  auth_mode?: PluginAuthMode;
}
export interface ToolParameter {
  name: string;
  required: boolean;
  description: string;
  type: string;
  sub_params: ToolParameter[];
}
export interface CardInfo {
  card_url: string;
  /** 以下只有详情页返回 */
  card_id: string;
  mapping_rule: string;
  max_display_rows: string;
  card_version: string;
}
export interface PluginToolExample {
  req_example: string;
  resp_example: string;
}
export enum PluginRunMode {
  DefaultToSync = 0,
  Sync = 1,
  Async = 2,
  Streaming = 3,
}
export interface PluginToolInfo {
  id: string;
  name: string;
  description: string;
  parameters?: ToolParameter[];
  card_info?: CardInfo;
  example?: PluginToolExample;
  /** 调用量 */
  call_amount?: number;
  /** 成功率 */
  success_rate?: number;
  /** 平均执行时长 */
  avg_exec_time?: number;
  /** tool 被bot引用数 */
  bots_use_count?: number;
  /** 运行模式 */
  run_mode?: PluginRunMode;
}
export interface PluginConnectorInfo {
  id: string;
  name: string;
  icon: string;
}
export interface BotPublishPlatform {
  id: string;
  icon_url: string;
  url: string;
  name: string;
}
export interface ProductMaterial {
  name: string;
  icon_url: string;
}
export interface BotVoiceInfo {
  id: string;
  language_code: string;
  language_name: string;
  name: string;
  style_id: string;
  is_support_voice_call: boolean;
}
export enum TimeCapsuleMode {
  Off = 0,
  On = 1,
}
export enum FileboxInfoMode {
  Off = 0,
  On = 1,
}
export interface UserQueryCollectConf {
  /**
   * bot用户query收集配置
   * 是否开启收集开关
   */
  is_collected: boolean;
  /** 隐私协议链接 */
  private_policy: string;
}
export interface BotConfig {
  /** 模型 */
  models?: ProductMaterial[];
  /** 插件 */
  plugins?: ProductMaterial[];
  /** 知识库 */
  knowledges?: ProductMaterial[];
  /** 工作流 */
  workflows?: ProductMaterial[];
  /** 私有插件数量 */
  private_plugins_count?: number;
  /** 私有知识库数量 */
  private_knowledges_count?: number;
  /** 私有工作流数量 */
  private_workflows_count?: number;
  /** 判断 multiagent 是否有 bot 节点 */
  has_bot_agent?: boolean;
  /** bot 配置的声音列表 */
  bot_voices?: BotVoiceInfo[];
  /** 所有插件数量 */
  total_plugins_count?: number;
  /** 所有知识库数量 */
  total_knowledges_count?: number;
  /** 所有工作流数量 */
  total_workflows_count?: number;
  /** 时间胶囊模式 */
  time_capsule_mode?: TimeCapsuleMode;
  /** 文件盒模式 */
  filebox_mode?: FileboxInfoMode;
  /** 私有图片工作流数量 */
  private_image_workflow_count?: number;
  /** 用户qeury收集配置 */
  user_query_collect_conf?: UserQueryCollectConf;
  /** 是否关闭语音通话（默认是打开） */
  is_close_voice_call?: boolean;
}
/** 消息涉及的bot信息,在home分享场景,消息属于多个bot */
export interface ConversationRelateBot {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}
/** 消息涉及的user信息,在home分享场景,消息属于多个user */
export interface ConversationRelateUser {
  user_info?: product_common.UserInfo;
}
export interface Conversation {
  /** 对话示例 */
  snippets?: string[];
  /** 对话标题 */
  title?: string;
  /** 对话ID，idGen生成 */
  id?: string;
  /** 是否需要生成对话 */
  gen_title?: boolean;
  /** 对话审核状态 */
  audit_status?: product_common.AuditStatus;
  /** 开场白 */
  opening_dialog?: product_common.OpeningDialog;
  /** 消息涉及的bot信息,key bot_id */
  relate_bots?: {
    [key: string | number]: ConversationRelateBot;
  };
  /** 消息涉及的user信息,key user_id */
  relate_users?: {
    [key: string | number]: ConversationRelateUser;
  };
}
export interface BotExtraInfo {
  /** 发布渠道 */
  publish_platforms: BotPublishPlatform[];
  /** 用户数 */
  user_count: number;
  /** 公开方式 */
  publish_mode: product_common.ProductPublishMode;
  /**
   * 详情页特有
   * 对话示例, 废弃
   */
  conversation_snippets?: string[][];
  /** 配置 */
  config?: BotConfig;
  /** 白名单 */
  is_inhouse_user?: boolean;
  /** 复制创建 bot 数量 */
  duplicate_bot_count?: number;
  /** 分享对话 */
  conversations?: Conversation[];
  /** 与 Bot 聊天的对话数 */
  chat_conversation_count?: string;
  /** 关联商品数 */
  related_product_count?: string;
}
export interface WorkflowParameter {
  name: string;
  desc: string;
  is_required: boolean;
  input_type: product_common.InputType;
  sub_parameters: WorkflowParameter[];
  /** 如果Type是数组，则有subtype */
  sub_type: product_common.InputType;
  /** 如果入参是用户手输 就放这里 */
  value?: string;
  format?: product_common.PluginParamTypeFormat;
  from_node_id?: string;
  from_output?: string[];
  /** InputType (+ AssistType) 定义一个变量的最终类型，仅需透传 */
  assist_type?: number;
  /** 展示名称（ store 独有的，用于详情页 GUI 展示参数） */
  show_name?: string;
  /** 如果InputType是数组，则有subassisttype */
  sub_assist_type?: number;
  /** 组件配置，由前端解析并渲染 */
  component_config?: string;
  /** 组件配置类型，前端展示需要 */
  component_type?: string;
}
export interface WorkflowTerminatePlan {
  /** 对应 workflow 结束节点的回答模式：1-返回变量，由Bot生成回答；2-使用设定的内容直接回答 */
  terminate_plan_type: number;
  /** 对应 terminate_plan_type = 2 的场景配置的返回内容 */
  content: string;
}
export interface WorkflowNodeParam {
  input_parameters?: WorkflowParameter[];
  terminate_plan?: WorkflowTerminatePlan;
  output_parameters?: WorkflowParameter[];
}
export interface WorkflowNodeInfo {
  node_id: string;
  node_type: product_common.WorkflowNodeType;
  node_param?: WorkflowNodeParam;
  /** 节点icon */
  node_icon_url: string;
  /** 展示名称（ store 独有的，用于详情页 GUI 展示消息节点的名称） */
  show_name?: string;
}
export interface WorkflowEntity {
  /** 商品ID */
  product_id: string;
  name: string;
  entity_id: string;
  entity_type: product_common.ProductEntityType;
  entity_version: string;
  icon_url: string;
  entity_name: string;
  readme: string;
  category: ProductCategory;
  /** 推荐分类                        , */
  recommended_category?: ProductCategory;
  nodes?: WorkflowNodeInfo[];
  desc: string;
  /** 入参 图片icon */
  case_input_icon_url?: string;
  /** 出参 图片icon */
  case_output_icon_url?: string;
  latest_publish_commit_id?: string;
}
export interface WorkflowGUIConfig {
  /** 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置 */
  start_node: WorkflowNodeInfo;
  end_node: WorkflowNodeInfo;
  /** 消息节点会输出中间过程，也需要展示 */
  message_nodes?: WorkflowNodeInfo[];
}
export interface WorkflowExtraInfo {
  related_workflows: WorkflowEntity[];
  duplicate_count?: number;
  /** workflow画布信息 */
  workflow_schema?: string;
  /**
   * api/workflowV2/query  schema_json
   * 推荐分类
   */
  recommended_category?: ProductCategory;
  nodes?: WorkflowNodeInfo[];
  start_node?: WorkflowNodeInfo;
  /** 实体名称(用于展示) */
  entity_name?: string;
  /** 用例图入参 */
  case_input_icon_url?: string;
  /** 用例图出参 */
  case_output_icon_url?: string;
  /** 案例执行ID */
  case_execute_id?: string;
  hover_text?: string;
  latest_publish_commit_id?: string;
  /** 试运行次数，从数仓取 */
  used_count?: number;
  /** 用于将 workflow 的输入/输出/中间消息节点节点转为用户可视化配置 */
  gui_config?: WorkflowGUIConfig;
}
export interface SocialScenePlayerInfo {
  id: string;
  name: string;
  role_type: product_common.SocialSceneRoleType;
}
export interface SocialSceneExtraInfo {
  /** 角色 */
  players?: SocialScenePlayerInfo[];
  /** 使用过的人数 */
  used_count: string;
  /** 开始过的次数 */
  started_count: string;
  /** 开闭源 */
  publish_mode: product_common.ProductPublishMode;
}
export interface ProjectConfig {
  /** 插件数量 */
  plugin_count: number;
  /** 工作流数量 */
  workflow_count: number;
  /** 知识库数量 */
  knowledge_count: number;
  /** 数据库数量 */
  database_count: number;
}
export interface ProjectExtraInfo {
  /** Project 上架为模板前生成一个模板副本，使用或者复制模板，需要用 TemplateProjectID 和 TemplateProjectVersion */
  template_project_id: string;
  template_project_version: string;
  /** Project 绑定的 UI 支持的预览类型 */
  preview_types: product_common.UIPreviewType[];
  /** 用户数 */
  user_count: number;
  /** 运行数 */
  execute_count: number;
  /** 发布渠道 */
  publish_platforms: BotPublishPlatform[];
  /** 近实时复制量，从数仓接口获取（复制 - 上报埋点 - 数仓计算落库） */
  duplicate_count: number;
  /** 配置 */
  config?: ProjectConfig;
}
export interface GetProductDetailRequest {
  product_id?: string;
  entity_type?: product_common.ProductEntityType;
  entity_id?: string;
  /** 是否查看最新的审核失败草稿 */
  need_audit_failed?: boolean;
  'Tt-Agw-Client-Ip'?: string;
}
export interface GetProductDetailResponse {
  code: number;
  message: string;
  data: GetProductDetailData;
}
export interface Price {
  value: number;
  currency: string;
  display_price: string;
}
export interface SKUInfo {
  id: string;
  /** 待废弃 */
  price: Price[];
  description: string;
  price_v2: marketplace_common.Price[];
  charge_sku_info?: product_common.ChargeSKUExtra;
}
export interface SellAttrValue {
  id: string;
  value: string;
}
export interface SellAttr {
  display_name: string;
  key: string;
  values: SellAttrValue[];
}
export interface SellInfo {
  skus: {
    [key: string | number]: SKUInfo;
  };
  attr: SellAttr[];
  /** Key 是 attrkey:attrvalue 路径，value 是 skuID */
  sku_attr_ref: {
    [key: string | number]: string;
  };
}
export interface Topic {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  /** 背景小图，前端优先加载 */
  banner_url_small: string;
  reason: string;
  /** 运营提供的专题介绍文档，用户可见 */
  introduction_url: string;
  /** 用户是否收藏专题 */
  is_favorite: boolean;
}
export interface ProductDataIndicator {
  /**
   * 数据分析指标，来源数仓，比如模板购买量、复制量等
   * 购买量
   */
  purchase_count?: number;
}
export interface GetProductDetailData {
  /** 下架的商品只返回非 optional 字段 */
  meta_info: ProductMetaInfo;
  /** 用以区分主/客态 */
  is_owner: boolean;
  /** 审核状态，主态下返回需要关注，如果主态且审核中，需要展示审核中状态 */
  audit_status: product_common.ProductDraftStatus;
  sell_info?: SellInfo;
  space_id?: string;
  /** 详情页返回 */
  topic?: Topic;
  /** 详情页返回 */
  can_duplicate?: boolean;
  commercial_setting?: product_common.CommercialSetting;
  plugin_extra?: PluginExtraInfo;
  bot_extra?: BotExtraInfo;
  workflow_extra?: WorkflowExtraInfo;
  social_scene_extra?: SocialSceneExtraInfo;
  project_extra?: ProjectExtraInfo;
  data_indicator?: ProductDataIndicator;
}
export interface GetUserFavoriteListV2Request {
  /** 第一页不传，后续调用时传上一次返回的cursor_id */
  cursor_id?: string;
  page_size: number;
  entity_type?: product_common.ProductEntityType;
  sort_type: product_common.SortType;
  /** 不为空则搜索 */
  keyword?: string;
  /** 列表页 tab */
  source?: product_common.FavoriteListSource;
  /** 是否需要查询用户对Bot的触发器配置，为true时，才会返回EntityUserTriggerConfig */
  need_user_trigger_config?: boolean;
  /** 筛选收藏时间 */
  begin_at?: string;
  /** 筛选收藏时间 */
  end_at?: string;
  entity_types?: product_common.ProductEntityType[];
  /** 组织ID，企业版想获取用户收藏的所有内容时需传递 */
  organization_id?: string;
}
export interface GetUserFavoriteListV2Response {
  code: number;
  message: string;
  data?: GetUserFavoriteListDataV2;
}
export interface GetUserFavoriteListDataV2 {
  favorite_entities: product_common.FavoriteEntity[];
  cursor_id: string;
  has_more: boolean;
  /**
   * 用户定时任务配置，对应flow.bot.task服务的TriggerEnabled
   * key: entity_id; value: UserTriggerConfig
   */
  entity_user_trigger_config: {
    [key: string | number]: UserTriggerConfig;
  };
}
export interface UserTriggerConfig {
  trigger_enabled: TriggerEnable;
}
export enum TriggerEnable {
  Init = 0,
  Open = 1,
  Close = 2,
}
export interface DuplicateProductRequest {
  product_id: string;
  entity_type: product_common.ProductEntityType;
  space_id?: string;
  name?: string;
  Cookie?: string;
}
export interface DuplicateProductResponse {
  code: number;
  message: string;
  data: DuplicateProductData;
}
export interface DuplicateProductData {
  /** 复制后的新id */
  new_entity_id: string;
  /** workflow对应的插件id */
  new_plugin_id?: string;
}
