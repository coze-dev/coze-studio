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
export enum BotModType {
  SingleAgent = 1,
  MultiAgent = 2,
}
export enum Component {
  UsePlugin = 1,
  UseWorkFlow = 2,
  UseKnowledge = 3,
  UseVoice = 4,
  UseCard = 5,
  UseImageWorkflow = 6,
}
export enum ProductEntityType {
  Bot = 1,
  Plugin = 2,
  /** Workflow = 3 , */
  SocialScene = 4,
  Project = 6,
  /** History workflow, no more in the future (abandoned) */
  WorkflowTemplate = 13,
  /** Historical image stream template, no more in the future (obsolete) */
  ImageflowTemplate = 15,
  /** Template universal identification, only used to bind template-related configurations, not bind products */
  TemplateCommon = 20,
  /** Bot template */
  BotTemplate = 21,
  /** workflow template */
  WorkflowTemplateV2 = 23,
  /** Image stream template (this type has been offline and merged into workflow, but historical data will be preserved, and the front end will be treated as workflow display) */
  ImageflowTemplateV2 = 25,
  /** project template */
  ProjectTemplate = 26,
  /** Coze token products, theoretically there will only be one */
  CozeToken = 50,
  /** Subscribe to the traffic package of credit, theoretically there will only be one */
  MsgCredit = 55,
  /** There is only one subscription product in theory */
  SubsMsgCredit = 60,
  Common = 99,
  /** Special Topics (Compatible with previous designs) */
  Topic = 101,
  /** Saas plugin,the plugins from coze saas */
  SaasPlugin = 901,
}
export enum SortType {
  Heat = 1,
  Newest = 2,
  /** collection time */
  FavoriteTime = 3,
  /** Correlation, only for search scenarios */
  Relative = 4,
}
export enum ProductPublishMode {
  OpenSource = 1,
  ClosedSource = 2,
}
export enum ProductListSource {
  /** recommended list page */
  Recommend = 1,
  /** personalized recommendation */
  CustomizedRecommend = 2,
}
export enum PluginType {
  /** default */
  CLoudPlugin = 0,
  LocalPlugin = 1,
}
export enum ProductPaidType {
  Free = 0,
  Paid = 1,
}
export interface CommercialSetting {
  commercial_type: ProductPaidType
}
export enum ProductStatus {
  /** NeverListed */
  NeverListed = 0,
  Listed = 1,
  Unlisted = 2,
  Banned = 3,
}
export interface UserLabel {
  label_id: string,
  label_name: string,
  icon_uri: string,
  icon_url: string,
  jump_link: string,
}
export interface UserInfo {
  user_id: string,
  user_name: string,
  name: string,
  avatar_url: string,
  user_label?: UserLabel,
  follow_type?: marketplace_common.FollowType,
}
export interface ImageInfo {
  uri: string,
  url: string,
}
export enum ProductDraftStatus {
  /** default */
  Default = 0,
  /** Under review. */
  Pending = 1,
  /** approved */
  Approved = 2,
  /** The review failed. */
  Rejected = 3,
  /** Abandoned */
  Abandoned = 4,
}
export type AuditStatus = ProductDraftStatus;
export interface OpeningDialog {
  /** Bot OpeningDialog */
  content: string
}
export enum InputType {
  String = 1,
  Integer = 2,
  Boolean = 3,
  Double = 4,
  List = 5,
  Object = 6,
}
export enum PluginParamTypeFormat {
  ImageUrl = 1,
}
export enum WorkflowNodeType {
  /** start */
  Start = 1,
  /** end */
  End = 2,
  /** Large model */
  LLM = 3,
  /** plugin */
  Api = 4,
  /** code */
  Code = 5,
  /** Knowledge Base */
  Dataset = 6,
  /** selector */
  If = 8,
  /** Workflow */
  SubWorkflow = 9,
  /** variable */
  Variable = 11,
  /** database */
  Database = 12,
  /** message */
  Message = 13,
}
export enum SocialSceneRoleType {
  Host = 1,
  PresetBot = 2,
  Custom = 3,
}
export enum UIPreviewType {
  /**
   * UI preview type, defining alignment UI Builder, currently used in Project
   * web page
  */
  Web = 1,
  /** mobile end */
  Client = 2,
}
export interface ChargeSKUExtra {
  quantity: string,
  is_self_define: boolean,
}
export enum FavoriteListSource {
  /** Created by users themselves */
  CreatedByMe = 1,
}
export interface FavoriteEntity {
  entity_id: string,
  entity_type: ProductEntityType,
  name: string,
  icon_url: string,
  description: string,
  /** Abandoned, using UserInfo */
  seller: SellerInfo,
  /** Use to jump to the bot edit page */
  space_id: string,
  /** Does the user have permissions to the space where the entity is located? */
  has_space_permission: boolean,
  /** collection time */
  favorite_at: string,
  product_extra?: FavoriteProductExtra,
  user_info: UserInfo,
  plugin_extra?: FavoritePluginExtra,
}
export interface SellerInfo {
  user_id: string,
  user_name: string,
  avatar_url: string,
}
export interface FavoriteProductExtra {
  product_id: string,
  product_status: ProductStatus,
}
export interface FavoritePluginExtra {
  tools: PluginTool[]
}
export interface PluginTool {
  id: string,
  name: string,
  description: string,
}