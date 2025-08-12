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

import * as marketplace_common from './marketplace_common';
export { marketplace_common };
import * as product_common from './product_common';
export { product_common };
import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
export const PublicGetProductList = /*#__PURE__*/createAPI<GetProductListRequest, GetProductListResponse>({
  "url": "/api/marketplace/product/list",
  "method": "GET",
  "name": "PublicGetProductList",
  "reqType": "GetProductListRequest",
  "reqMapping": {
    "body": ["entity_type", "sort_type", "page_num", "page_size", "keyword", "publish_mode", "source", "current_entity_type", "preview_topic_id", "is_official", "need_extra", "entity_types", "is_free", "plugin_type"],
    "query": ["category_id", "publish_platform_ids", "current_entity_id", "current_entity_version", "topic_id"],
    "header": ["Tt-Agw-Client-Ip"]
  },
  "resType": "GetProductListResponse",
  "schemaRoot": "api://schemas/idl_marketplace_public_api",
  "service": "explore"
});
export const PublicGetProductDetail = /*#__PURE__*/createAPI<GetProductDetailRequest, GetProductDetailResponse>({
  "url": "/api/marketplace/product/detail",
  "method": "GET",
  "name": "PublicGetProductDetail",
  "reqType": "GetProductDetailRequest",
  "reqMapping": {
    "query": ["product_id", "entity_id"],
    "body": ["entity_type", "need_audit_failed"],
    "header": ["Tt-Agw-Client-Ip"]
  },
  "resType": "GetProductDetailResponse",
  "schemaRoot": "api://schemas/idl_marketplace_public_api",
  "service": "explore"
});
export const PublicFavoriteProduct = /*#__PURE__*/createAPI<FavoriteProductRequest, FavoriteProductResponse>({
  "url": "/api/marketplace/product/favorite",
  "method": "POST",
  "name": "PublicFavoriteProduct",
  "reqType": "FavoriteProductRequest",
  "reqMapping": {
    "body": ["product_id", "entity_type", "is_cancel", "entity_id", "topic_id"],
    "header": ["Cookie"]
  },
  "resType": "FavoriteProductResponse",
  "schemaRoot": "api://schemas/idl_marketplace_public_api",
  "service": "explore"
});
export const PublicGetUserFavoriteListV2 = /*#__PURE__*/createAPI<GetUserFavoriteListV2Request, GetUserFavoriteListV2Response>({
  "url": "/api/marketplace/product/favorite/list.v2",
  "method": "GET",
  "name": "PublicGetUserFavoriteListV2",
  "reqType": "GetUserFavoriteListV2Request",
  "reqMapping": {
    "query": ["cursor_id", "page_size", "entity_type", "sort_type", "keyword", "source", "need_user_trigger_config", "begin_at", "end_at", "entity_types", "organization_id"]
  },
  "resType": "GetUserFavoriteListV2Response",
  "schemaRoot": "api://schemas/idl_marketplace_public_api",
  "service": "explore"
});
export const PublicDuplicateProduct = /*#__PURE__*/createAPI<DuplicateProductRequest, DuplicateProductResponse>({
  "url": "/api/marketplace/product/duplicate",
  "method": "POST",
  "name": "PublicDuplicateProduct",
  "reqType": "DuplicateProductRequest",
  "reqMapping": {
    "body": ["product_id", "entity_type", "space_id", "name"],
    "header": ["Cookie"]
  },
  "resType": "DuplicateProductResponse",
  "schemaRoot": "api://schemas/idl_marketplace_public_api",
  "service": "explore"
});
export interface FavoriteProductResponse {
  code: number,
  message: string,
  is_first_favorite?: boolean,
}
export interface FavoriteProductRequest {
  product_id?: string,
  entity_type: product_common.ProductEntityType,
  is_cancel?: boolean,
  entity_id?: string,
  topic_id?: string,
  Cookie?: string,
}
export interface GetProductListRequest {
  entity_type?: product_common.ProductEntityType,
  category_id?: string,
  sort_type: product_common.SortType,
  page_num: number,
  page_size: number,
  /** non-empty search */
  keyword?: string,
  /** Open mode: 1-open source; 2-closed source,//open mode */
  publish_mode?: product_common.ProductPublishMode,
  /** publish platforms */
  publish_platform_ids?: string[],
  /** List tab; 1 - Operational recommendations */
  source?: product_common.ProductListSource,
  /**
   * Personalized recommendation scenarios, enter current entity information, and obtain recommended products
   * Current entity type
  */
  current_entity_type?: product_common.ProductEntityType,
  /** Current entity ID */
  current_entity_id?: string,
  /** Current entity version */
  current_entity_version?: string,
  /** thematic scenario */
  topic_id?: string,
  preview_topic_id?: string,
  /** Do you need to filter out official products? */
  is_official?: boolean,
  /** Do you need to return additional information? */
  need_extra?: boolean,
  /** List of product types, use this parameter first, followed by EntityType */
  entity_types?: product_common.ProductEntityType[],
  /** True = filter for free; false = filter for paid; if you don't pass it, you won't distinguish between free and paid. */
  is_free?: boolean,
  /** plugin type */
  plugin_type?: product_common.PluginType,
  "Tt-Agw-Client-Ip"?: string,
}
export interface GetProductListResponse {
  code: number,
  message: string,
  data: GetProductListData,
}
export interface GetProductListData {
  products?: ProductInfo[],
  has_more: boolean,
  total: number,
}
export interface ProductInfo {
  meta_info: ProductMetaInfo,
  user_behavior?: UserBehaviorInfo,
  commercial_setting?: product_common.CommercialSetting,
  plugin_extra?: PluginExtraInfo,
  bot_extra?: BotExtraInfo,
  workflow_extra?: WorkflowExtraInfo,
  social_scene_extra?: SocialSceneExtraInfo,
  project_extra?: ProjectExtraInfo,
}
export interface SellerInfo {
  id: string,
  name: string,
  avatar_url: string,
}
export interface ProductCategory {
  id: string,
  name: string,
  icon_url: string,
  active_icon_url: string,
  index: number,
  count: number,
}
export interface ProductLabel {
  name: string
}
export interface ProductMetaInfo {
  id: string,
  /** Product/Template Name */
  name: string,
  /** Creature ID, determined by entity_type is the ID of the bot/plugin */
  entity_id: string,
  /** Product material type */
  entity_type: product_common.ProductEntityType,
  /** Product/template avatar */
  icon_url: string,
  /** Heat: Template heat = copy volume (used for card display/sorting); product heat = different products have independent calculation logic (only used for sorting) - the calculation of heat has a certain delay */
  heat: number,
  favorite_count: number,
  /** Obsolete, use UserInfo instead */
  seller: SellerInfo,
  /** Product description */
  description: string,
  listed_at: string,
  status: product_common.ProductStatus,
  /** Product/template classification information */
  category?: ProductCategory,
  /** Whether to collect */
  is_favorited: boolean,
  is_free: boolean,
  /** Template introduction/plugin introduction (currently in rich text format) */
  readme: string,
  entity_version?: string,
  labels?: ProductLabel[],
  user_info: product_common.UserInfo,
  medium_icon_url: string,
  origin_icon_url: string,
  /** Template cover */
  covers?: product_common.ImageInfo[],
  /** Is the professional version specially available? */
  is_professional?: boolean,
  /** Is it a template? */
  is_template: boolean,
  /** Is it an official product? */
  is_official: boolean,
  /** Price, currently only available in the template. */
  price?: marketplace_common.Price,
}
export interface UserBehaviorInfo {
  /**
   * The user homepage needs to return the most recently viewed/used product time.
   * Latest Viewtimestamp
  */
  viewed_at?: string,
  /** Recently used timestamp */
  used_at?: string,
}
export enum PluginAuthMode {
  /** No authorization required. */
  NoAuth = 0,
  /** Authorization required, but no authorization configuration */
  Required = 1,
  /** Authorization is required and has been configured */
  Configured = 2,
  /** Authorization is required, but the authorization configuration may be user-level and can be configured by the user himself */
  Supported = 3,
}
export interface PluginExtraInfo {
  tools?: PluginToolInfo[],
  total_api_count: number,
  bots_use_count: number,
  /** Is there a privacy statement, currently only PublicGetProductDetail will take the data */
  has_private_statement?: boolean,
  /** Privacy statement, currently only PublicGetProductDetail will access data */
  private_statement?: string,
  associated_bots_use_count: number,
  is_premium: boolean,
  is_official: boolean,
  /** call amount */
  call_amount?: number,
  /** success rate */
  success_rate?: number,
  /** average execution time */
  avg_exec_time?: number,
  is_default_icon?: boolean,
  space_id?: string,
  material_id?: string,
  connectors: PluginConnectorInfo[],
  plugin_type?: product_common.PluginType,
  /** for opencoze */
  auth_mode?: PluginAuthMode,
  /** for opencoze */
  auth_mode?: PluginAuthMode,
}
export interface ToolParameter {
  name: string,
  required: boolean,
  description: string,
  type: string,
  sub_params: ToolParameter[],
}
export interface CardInfo {
  card_url: string,
  /** Only the details page returns */
  card_id: string,
  mapping_rule: string,
  max_display_rows: string,
  card_version: string,
}
export interface PluginToolExample {
  req_example: string,
  resp_example: string,
}
export enum PluginRunMode {
  DefaultToSync = 0,
  Sync = 1,
  Async = 2,
  Streaming = 3,
}
export interface PluginToolInfo {
  id: string,
  name: string,
  description: string,
  parameters?: ToolParameter[],
  card_info?: CardInfo,
  example?: PluginToolExample,
  /** call amount */
  call_amount?: number,
  /** success rate */
  success_rate?: number,
  /** average execution time */
  avg_exec_time?: number,
  /** Number of tool bot references */
  bots_use_count?: number,
  /** operating mode */
  run_mode?: PluginRunMode,
}
export interface PluginConnectorInfo {
  id: string,
  name: string,
  icon: string,
}
export interface BotPublishPlatform {
  id: string,
  icon_url: string,
  url: string,
  name: string,
}
export interface ProductMaterial {
  name: string,
  icon_url: string,
}
export interface BotVoiceInfo {
  id: string,
  language_code: string,
  language_name: string,
  name: string,
  style_id: string,
  is_support_voice_call: boolean,
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
   * Bot user query collection configuration
   * Whether to turn on the collection switch
  */
  is_collected: boolean,
  /** Privacy Policy Link */
  private_policy: string,
}
export interface BotConfig {
  /** model */
  models?: ProductMaterial[],
  /** plugin */
  plugins?: ProductMaterial[],
  /** Knowledge Base */
  knowledges?: ProductMaterial[],
  /** Workflow */
  workflows?: ProductMaterial[],
  /** number of private plugins */
  private_plugins_count?: number,
  /** Number of private repositories */
  private_knowledges_count?: number,
  /** number of private workflows */
  private_workflows_count?: number,
  /** Determine if the multiagent has a bot node */
  has_bot_agent?: boolean,
  /** List of sounds configured by bot */
  bot_voices?: BotVoiceInfo[],
  /** Number of all plugins */
  total_plugins_count?: number,
  /** Number of all knowledge bases */
  total_knowledges_count?: number,
  /** Number of all workflows */
  total_workflows_count?: number,
  /** Time Capsule Mode */
  time_capsule_mode?: TimeCapsuleMode,
  /** File box mode */
  filebox_mode?: FileboxInfoMode,
  /** Number of private image workflows */
  private_image_workflow_count?: number,
  /** User qeury collection configuration */
  user_query_collect_conf?: UserQueryCollectConf,
  /** Whether to turn off voice calls (the default is on) */
  is_close_voice_call?: boolean,
}
/** The bot information involved in the message, sharing the scene in the home, the message belongs to multiple bots */
export interface ConversationRelateBot {
  id: string,
  name: string,
  description: string,
  icon_url: string,
}
/** The user information involved in the message, sharing the scene in the home, the message belongs to multiple users */
export interface ConversationRelateUser {
  user_info?: product_common.UserInfo
}
export interface Conversation {
  /** conversation example */
  snippets?: string[],
  /** conversation title */
  title?: string,
  /** Conversation ID, generated by idGen */
  id?: string,
  /** Do you need to generate a conversation? */
  gen_title?: boolean,
  /** conversation moderation status */
  audit_status?: product_common.AuditStatus,
  /** opening statement */
  opening_dialog?: product_common.OpeningDialog,
  /** The bot information involved in the message, key bot_id */
  relate_bots?: {
    [key: string | number]: ConversationRelateBot
  },
  /** The user information involved in the message, key user_id */
  relate_users?: {
    [key: string | number]: ConversationRelateUser
  },
}
export interface BotExtraInfo {
  /** publish platforms */
  publish_platforms: BotPublishPlatform[],
  /** user count */
  user_count: number,
  /** public method */
  publish_mode: product_common.ProductPublishMode,
  /**
   * Details page unique
   * Dialogue example, abandoned
  */
  conversation_snippets?: string[][],
  /** configuration */
  config?: BotConfig,
  /** whitelist */
  is_inhouse_user?: boolean,
  /** Number of copy-created bots */
  duplicate_bot_count?: number,
  /** Share the conversation */
  conversations?: Conversation[],
  /** Number of conversations with Bot */
  chat_conversation_count?: string,
  /** number of related products */
  related_product_count?: string,
}
export interface WorkflowParameter {
  name: string,
  desc: string,
  is_required: boolean,
  input_type: product_common.InputType,
  sub_parameters: WorkflowParameter[],
  /** If Type is an array, there is a subtype */
  sub_type: product_common.InputType,
  /** If the imported parameter is the user's hand input, put it here */
  value?: string,
  format?: product_common.PluginParamTypeFormat,
  from_node_id?: string,
  from_output?: string[],
  /** InputType (+ AssistType) defines the final type of a variable, which only needs to be passed through */
  assist_type?: number,
  /** Display name (unique to the store, used for details page GUI display parameters) */
  show_name?: string,
  /** If the InputType is an array, there is a subassistant type */
  sub_assist_type?: number,
  /** Component configuration, parsed and rendered by the front end */
  component_config?: string,
  /** Component configuration type, required for front-end display */
  component_type?: string,
}
export interface WorkflowTerminatePlan {
  /** The answer mode corresponding to the end node of the workflow: 1 - Return the variable, and the Bot generates the answer; 2 - Use the set content to answer directly */
  terminate_plan_type: number,
  /** Return content of scene configuration corresponding to terminate_plan_type = 2 */
  content: string,
}
export interface WorkflowNodeParam {
  input_parameters?: WorkflowParameter[],
  terminate_plan?: WorkflowTerminatePlan,
  output_parameters?: WorkflowParameter[],
}
export interface WorkflowNodeInfo {
  node_id: string,
  node_type: product_common.WorkflowNodeType,
  node_param?: WorkflowNodeParam,
  /** Node icon */
  node_icon_url: string,
  /** Presentation name (unique to the store, the name used for the details page GUI display message node) */
  show_name?: string,
}
export interface WorkflowEntity {
  /** Product ID */
  product_id: string,
  name: string,
  entity_id: string,
  entity_type: product_common.ProductEntityType,
  entity_version: string,
  icon_url: string,
  entity_name: string,
  readme: string,
  category: ProductCategory,
  /** Recommended categories, */
  recommended_category?: ProductCategory,
  nodes?: WorkflowNodeInfo[],
  desc: string,
  /** Imported parameters Picture icon */
  case_input_icon_url?: string,
  /** Exported parameters Image icon */
  case_output_icon_url?: string,
  latest_publish_commit_id?: string,
}
export interface WorkflowGUIConfig {
  /** Used to convert the input/output/intermediate message node of a workflow into a user visual configuration */
  start_node: WorkflowNodeInfo,
  end_node: WorkflowNodeInfo,
  /** The message node will output the intermediate process, which also needs to be displayed. */
  message_nodes?: WorkflowNodeInfo[],
}
export interface WorkflowExtraInfo {
  related_workflows: WorkflowEntity[],
  duplicate_count?: number,
  /** Workflow canvas information */
  workflow_schema?: string,
  /**
   * api/workflowV2/query  schema_json
   * recommended classification
  */
  recommended_category?: ProductCategory,
  nodes?: WorkflowNodeInfo[],
  start_node?: WorkflowNodeInfo,
  /** Entity name (for presentation) */
  entity_name?: string,
  /** Use case diagrams imported parameters */
  case_input_icon_url?: string,
  /** Use case diagram exported parameters */
  case_output_icon_url?: string,
  /** case execution ID */
  case_execute_id?: string,
  hover_text?: string,
  latest_publish_commit_id?: string,
  /** Practice running times, take from the number of warehouses */
  used_count?: number,
  /** Used to convert the input/output/intermediate message node of a workflow into a user visual configuration */
  gui_config?: WorkflowGUIConfig,
}
export interface SocialScenePlayerInfo {
  id: string,
  name: string,
  role_type: product_common.SocialSceneRoleType,
}
export interface SocialSceneExtraInfo {
  /** role */
  players?: SocialScenePlayerInfo[],
  /** Number of people used */
  used_count: string,
  /** number of times started */
  started_count: string,
  /** publish_mode */
  publish_mode: product_common.ProductPublishMode,
}
export interface ProjectConfig {
  /** number of plugins */
  plugin_count: number,
  /** number of workflows */
  workflow_count: number,
  /** Number of knowledge bases */
  knowledge_count: number,
  /** Number of databases */
  database_count: number,
}
export interface ProjectExtraInfo {
  /** Generate a copy of the template before Project is put on the shelves. To use or copy the template, you need to use TemplateProjectID and TemplateProjectVersion */
  template_project_id: string,
  template_project_version: string,
  /** Project-bound UI supported preview types */
  preview_types: product_common.UIPreviewType[],
  /** user count */
  user_count: number,
  /** number of runs */
  execute_count: number,
  /** publish platforms */
  publish_platforms: BotPublishPlatform[],
  /** Near real-time copy volume, obtained from the data warehouse interface (copy-report event tracking-data warehouse calculation drop library) */
  duplicate_count: number,
  /** configuration */
  config?: ProjectConfig,
}
export interface GetProductDetailRequest {
  product_id?: string,
  entity_type?: product_common.ProductEntityType,
  entity_id?: string,
  /** Whether to check the latest audit failure draft */
  need_audit_failed?: boolean,
  "Tt-Agw-Client-Ip"?: string,
}
export interface GetProductDetailResponse {
  code: number,
  message: string,
  data: GetProductDetailData,
}
export interface Price {
  value: number,
  currency: string,
  display_price: string,
}
export interface SKUInfo {
  id: string,
  /** to be abandoned */
  price: Price[],
  description: string,
  price_v2: marketplace_common.Price[],
  charge_sku_info?: product_common.ChargeSKUExtra,
}
export interface SellAttrValue {
  id: string,
  value: string,
}
export interface SellAttr {
  display_name: string,
  key: string,
  values: SellAttrValue[],
}
export interface SellInfo {
  skus: {
    [key: string | number]: SKUInfo
  },
  attr: SellAttr[],
  /** Key is attrkey: attrvalue path, value is skuID */
  sku_attr_ref: {
    [key: string | number]: string
  },
}
export interface Topic {
  id: string,
  name: string,
  description: string,
  banner_url: string,
  /** Small background image, front-end priority loading */
  banner_url_small: string,
  reason: string,
  /** The presentation document provided by the operation is visible to users */
  introduction_url: string,
  /** Does the user collect the topic? */
  is_favorite: boolean,
}
export interface ProductDataIndicator {
  /**
   * Data analytics metrics, source number, such as template purchases, replicas, etc
   * purchase volume
  */
  purchase_count?: number
}
export interface GetProductDetailData {
  /** Products removed from the shelves only return non-optional fields */
  meta_info: ProductMetaInfo,
  /** To distinguish between host and guest states */
  is_owner: boolean,
  /** Audit status, return in the main state, you need to pay attention. If the main state is under review, you need to show the status under review. */
  audit_status: product_common.ProductDraftStatus,
  sell_info?: SellInfo,
  space_id?: string,
  /** Details page Back */
  topic?: Topic,
  /** Details page Back */
  can_duplicate?: boolean,
  commercial_setting?: product_common.CommercialSetting,
  plugin_extra?: PluginExtraInfo,
  bot_extra?: BotExtraInfo,
  workflow_extra?: WorkflowExtraInfo,
  social_scene_extra?: SocialSceneExtraInfo,
  project_extra?: ProjectExtraInfo,
  data_indicator?: ProductDataIndicator,
}
export interface GetUserFavoriteListV2Request {
  /** The first page is not passed, and the last returned cursor_id is passed when subsequent calls are made */
  cursor_id?: string,
  page_size: number,
  entity_type?: product_common.ProductEntityType,
  sort_type: product_common.SortType,
  /** Search keyword,optional */
  keyword?: string,
  /** List page tab */
  source?: product_common.FavoriteListSource,
  /** Whether you need to query the user's trigger configuration for the Bot, when true, it will return EntityUserTriggerConfig */
  need_user_trigger_config?: boolean,
  /** Filter collection time */
  begin_at?: string,
  /** Filter collection time */
  end_at?: string,
  entity_types?: product_common.ProductEntityType[],
  /** Organization ID, Enterprise Edition needs to be passed when you want to get all the content in the user's collection */
  organization_id?: string,
}
export interface GetUserFavoriteListV2Response {
  code: number,
  message: string,
  data?: GetUserFavoriteListDataV2,
}
export interface GetUserFavoriteListDataV2 {
  favorite_entities: product_common.FavoriteEntity[],
  cursor_id: string,
  has_more: boolean,
  /**
   * User timed task configuration, corresponding to flow.bot TriggerEnabled of the task service
   * key: entity_id; value: UserTriggerConfig
  */
  entity_user_trigger_config: {
    [key: string | number]: UserTriggerConfig
  },
}
export interface UserTriggerConfig {
  trigger_enabled: TriggerEnable
}
export enum TriggerEnable {
  Init = 0,
  Open = 1,
  Close = 2,
}
export interface DuplicateProductRequest {
  product_id: string,
  entity_type: product_common.ProductEntityType,
  space_id?: string,
  name?: string,
  Cookie?: string,
}
export interface DuplicateProductResponse {
  code: number,
  message: string,
  data: DuplicateProductData,
}
export interface DuplicateProductData {
  /** New ID after copy */
  new_entity_id: string,
  /** Plugin ID for workflow */
  new_plugin_id?: string,
}