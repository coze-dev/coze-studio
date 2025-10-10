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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as marketplace_common from './marketplace_common';

export type Int64 = string | number;

export enum BotModType {
  SingleAgent = 1,
  MultiAgent = 2,
}

export enum BusinessType {
  /** 商品的经营类型
自营 */
  SelfOperated = 1,
  /** 社区（与三方开发者合作） */
  Community = 2,
}

export enum CapacityType {
  PluginQPS = 65,
}

export enum Component {
  UsePlugin = 1,
  UseWorkFlow = 2,
  UseKnowledge = 3,
  UseVoice = 4,
  UseCard = 5,
  UseImageWorkflow = 6,
}

export enum ContentType {
  Markdown = 1,
}

export enum FavoriteListSource {
  /** 用户自己创建的 */
  CreatedByMe = 1,
}

/** feedCard */
export enum FeedType {
  /** 推荐用户feed */
  Recommend = 0,
  /** 商品发布feed */
  ProductPublish = 1,
  /** 商品更新feed */
  ProductUpdate = 2,
  /** 官方消息feed */
  OfficialMessage = 3,
}

export enum InputType {
  String = 1,
  Integer = 2,
  Boolean = 3,
  Double = 4,
  List = 5,
  Object = 6,
}

export enum Origin {
  PluginAdmin = 1,
  BotUser = 2,
  MarketplaceAdmin = 3,
  /** 举报召回下架 */
  ReportAdmin = 4,
  /** 商店渠道下架 */
  StoreChannel = 5,
}

export enum PluginParamTypeFormat {
  ImageUrl = 1,
}

export enum PluginType {
  /** default */
  CLoudPlugin = 0,
  LocalPlugin = 1,
}

export enum PriceType {
  Free = 1,
  Paid = 2,
}

export enum ProductDraftStatus {
  /** 默认 */
  Default = 0,
  /** 审核中 */
  Pending = 1,
  /** 审核通过 */
  Approved = 2,
  /** 审核不通过 */
  Rejected = 3,
  /** 已废弃 */
  Abandoned = 4,
}

export enum ProductEntityType {
  Bot = 1,
  Plugin = 2,
  /** Workflow = 3 , */
  SocialScene = 4,
  Project = 6,
  /** 历史工作流，后续不会再有（废弃） */
  WorkflowTemplate = 13,
  /** 历史图像流模板，后续不会再有（废弃） */
  ImageflowTemplate = 15,
  /** 模板通用标识，仅用于绑定模板相关的配置，不绑定商品 */
  TemplateCommon = 20,
  /** Bot 模板 */
  BotTemplate = 21,
  /** 工作流模板 */
  WorkflowTemplateV2 = 23,
  /** 图像流模板（该类型已下线，合并入 workflow，但历史数据会保留，前端视作 workflow 展示） */
  ImageflowTemplateV2 = 25,
  /** 项目模板 */
  ProjectTemplate = 26,
  /** coze token 类商品，理论上只会有一个 */
  CozeToken = 50,
  /** 订阅 credit 的流量包，理论上只会有一个 */
  MsgCredit = 55,
  /** 消息订阅类商品，理论上只有一个 */
  SubsMsgCredit = 60,
  Common = 99,
  /** 专题（兼容之前的设计） */
  Topic = 101,
  /** 开源版本区分是否是saas插件使用 */
  SaasPlugin = 901,
}

export enum ProductListingPeriodType {
  /** 最近一次上架在 7 天前 */
  CreatedBefore7D = 1,
  /** 最近一次上架在 7 天内 */
  UpdatedIn7D = 2,
  /** 第一次上架在 7 天内 */
  CreatedIn7D = 3,
}

export enum ProductListSource {
  /** 推荐列表页 */
  Recommend = 1,
  /** 个性化推荐 */
  CustomizedRecommend = 2,
}

export enum ProductListType {
  ByAdmin = 1,
  ByUser = 2,
}

export enum ProductPaidType {
  Free = 0,
  Paid = 1,
}

export enum ProductPublishMode {
  OpenSource = 1,
  ClosedSource = 2,
}

export enum ProductShareScene {
  StoreShareBotConversation = 1,
  HomtShareBotConversation = 2,
}

export enum ProductShareType {
  BotConversation = 1,
}

export enum ProductStatus {
  /** 从未上架 */
  NeverListed = 0,
  Listed = 1,
  Unlisted = 2,
  Banned = 3,
}

export enum ProductUnlistType {
  ByAdmin = 1,
  ByUser = 2,
}

export enum ProjectType {
  /** 默认 */
  DEFAULT = 0,
  /** 初见-AI生成 */
  Chux = 1,
}

export enum ResourceType {
  /** 项目商品/模板用到的资源 */
  Plugin = 1,
}

export enum SocialSceneRoleType {
  Host = 1,
  PresetBot = 2,
  Custom = 3,
}

export enum SortType {
  Heat = 1,
  Newest = 2,
  /** 收藏时间 */
  FavoriteTime = 3,
  /** 相关性，只用于搜索场景 */
  Relative = 4,
}

export enum SubscribeSKUType {
  /** 自动续费 */
  AutoRenew = 0,
  /** 一次性订阅 */
  OneOff = 1,
}

export enum TaskStatus {
  Running = 1,
  Succeed = 2,
  Failed = 3,
}

export enum TopicStatus {
  /** 创建专题后先置0 */
  Init = 0,
  Listed = 1,
  Unlisted = 2,
}

export enum UIPreviewType {
  /** UI 预览类型，定义对齐 UI Builder，目前用于 Project
网页端 */
  Web = 1,
  /** 移动端 */
  Client = 2,
}

export enum UnitType {
  YEAR = 1,
  MONTH = 2,
  WEEK = 3,
  DAY = 4,
  HOUR = 5,
  MINUTE = 6,
}

export enum UserActionType {
  UsedProduct = 1,
  /** 进入过 product 的详情页 */
  ViewedProduct = 2,
}

export enum UserProductSource {
  /** 用户发布过的已上架商品 */
  Listed = 1,
  /** 用户使用过的商品（比如对话过的Bot） */
  Used = 2,
  /** 用户访问过的商品 */
  Viewed = 3,
  /** 用户收藏的商品 */
  Favorite = 4,
  /** 用户点赞的商品 */
  Like = 5,
}

export enum VerifyStatus {
  /** 未认证 */
  Pending = 1,
  /** 认证成功 */
  Succeed = 2,
  /** 认证失败 */
  Failed = 3,
  /** 认证中 */
  InProgress = 4,
}

export enum WorkflowNodeType {
  /** 开始 */
  Start = 1,
  /** 结束 */
  End = 2,
  /** 大模型 */
  LLM = 3,
  /** 插件 */
  Api = 4,
  /** 代码 */
  Code = 5,
  /** 知识库 */
  Dataset = 6,
  /** 选择器 */
  If = 8,
  /** 工作流 */
  SubWorkflow = 9,
  /** 变量 */
  Variable = 11,
  /** 数据库 */
  Database = 12,
  /** 消息 */
  Message = 13,
}

export interface BuildSetting {
  /** 支持线索提交 */
  support_build_leads?: boolean;
}

export interface CapacityExtension {
  capacity_type?: CapacityType;
  /** 对应权益侧的客户套餐：0-免费；100-存量专业版；110-个人旗舰版；120-团队版；130-企业版 */
  user_level?: number;
  default_amount?: number;
  /** 扩容上限，当支持扩容时有值 */
  max_amount?: number;
  /** 是否支持扩容 */
  is_support_extension?: boolean;
}

export interface ChargeItem {
  /** 计费项
免费额度 */
  free_quota?: number;
  /** 计费项标识 */
  code?: string;
  /** 单价 */
  price?: number;
  /** 单价单位 */
  unit?: string;
  /** 万有商品配置配置项编码 */
  configuration_code?: string;
}

export interface ChargeSKUExtra {
  quantity?: string;
  is_self_define?: boolean;
}

export interface CommercialSetting {
  commercial_type?: ProductPaidType;
  /** 经营类型 */
  business_type?: BusinessType;
  /** 结算设置 */
  settlement?: Settlement;
  capacity_extensions?: Array<CapacityExtension>;
  /** 计费项 */
  charge_items?: Array<ChargeItem>;
  /** 协议 */
  product_agreements?: Array<ProductAgreement>;
  /** 用户维度的信息
是否已开通三方付费插件 */
  has_activate?: boolean;
}

export interface FavoriteEntity {
  entity_id?: string;
  entity_type?: ProductEntityType;
  name?: string;
  icon_url?: string;
  description?: string;
  /** 废弃，使用UserInfo */
  seller?: SellerInfo;
  /** 用于跳转到Bot编辑页 */
  space_id?: string;
  /** 用户是否有该实体所在Space的权限 */
  has_space_permission?: boolean;
  /** 收藏时间 */
  favorite_at?: string;
  product_extra?: FavoriteProductExtra;
  user_info?: UserInfo;
  plugin_extra?: FavoritePluginExtra;
  project_extra?: FavoriteProjectExtra;
}

export interface FavoritePluginExtra {
  tools?: Array<PluginTool>;
}

export interface FavoriteProductExtra {
  product_id?: string;
  product_status?: ProductStatus;
  product_availability?: ProductAvailability;
  /** 商业化配置，运营后台展示配置信息供产品审核 */
  commercial_setting?: CommercialSetting;
}

export interface FavoriteProjectExtra {
  project_id?: string;
  project_type?: ProjectType;
}

/** feed 卡片 */
export interface FeedCard {
  /** 必传字段，feed类型 */
  feed_type?: FeedType;
  /** 必传字段，feed正文 */
  feed_content?: FeedContent;
  /** 可选字段，feed生成时间，毫秒时间戳 */
  create_time?: string;
  /** API层必传字段，feed推送可选字段，用户信息 */
  user_info?: UserInfo;
  /** API层必传字段，feed推送可选字段，feed_id */
  id?: string;
}

/** feed主体, message & quote两者必传其一 */
export interface FeedContent {
  /** 可选字段，标题 */
  title?: RichText;
  /** 可选字段，主体-消息 */
  message?: RichText;
  /** 可选字段，主体-引用区 */
  quote?: FeedQuote;
}

/** 引用区 */
export interface FeedQuote {
  /** 可选字段，商品卡片 */
  product_card?: Array<ProductFeedInfo>;
}

export interface ImageInfo {
  uri?: string;
  url?: string;
}

export interface ImageUploadToken {
  access_key_id?: string;
  secret_access_key?: string;
  session_token?: string;
  expired_time?: string;
  current_time?: string;
  service_id?: string;
  upload_host?: string;
}

export interface OpeningDialog {
  /** Bot开场白 */
  content?: string;
}

export interface PartnerProduct {
  /** 万有伙伴信息
伙伴账号ID */
  account_id?: string;
  /** 伙伴账号名称 */
  account_name?: string;
  /** 万有商品 code */
  product_code?: string;
}

export interface PluginTool {
  id?: string;
  name?: string;
  description?: string;
}

export interface ProductAgreement {
  /** 协议基础信息
弹窗相关：签署协议的弹窗标题（不同插件可能不一样） */
  title?: string;
  /** 弹窗相关：签署协议时的描述（不同插件可能不一样） */
  description?: string;
  /** 协议的具体链接 */
  link?: string;
  /** 协议名称 */
  name?: string;
  /** 协议 - 用户维度信息（非所有协议都需要）
用户是否已经签署协议 */
  has_signed?: boolean;
  /** 用户是否能够签署协议 */
  can_sign?: boolean;
}

/** 商品可用性相关配置：HTTP 接口和 RPC 接口都需要 */
export interface ProductAvailability {
  /** 用户等级 >= user_level 时，可用该商品；枚举值对应 benefit_common.UserLevel */
  user_level?: number;
  /** 商品协议相关
是否需要签署协议后才能使用 */
  need_sign_agreement?: boolean;
  /** 商品协议相关 */
  product_agreement?: ProductAgreement;
}

export interface ProductEntity {
  entity_type: ProductEntityType;
  /** 可选 */
  entity_id?: string;
  /** 可选 */
  entity_version?: string;
}

export interface ProductFeedInfo {
  /** 必传字段，商品id */
  id?: string;
  /** 必传字段，商品名 */
  name?: string;
  /** 必传字段，商品icon */
  icon_url?: string;
  /** 必传字段，商品描述 */
  desc?: string;
  /** 必传字段，素材类型 */
  entity_type?: ProductEntityType;
  /** 可选字段，用户数, for bot, project */
  user_count?: number;
  /** 可选字段，对话数, for bot */
  chat_conversation_count?: number;
  /** 可选字段，收藏数, for bot */
  favorite_count?: number;
  /** 可选字段，bots使用数,for plugin */
  bots_use_cout?: number;
  /** 可选字段，复制数, for workflow & imageflow */
  duplicate_count?: number;
  /** 可选字段，使用数, for project */
  use_count?: number;
}

/** 富文本类型 */
export interface RichText {
  /** 必传字段，富文本数据类型 */
  content_type?: ContentType;
  /** 必传字段，数据内容 */
  text?: string;
}

export interface SellerInfo {
  user_id?: string;
  user_name?: string;
  avatar_url?: string;
}

export interface Settlement {
  /** 结算设置
万有伙伴信息 - 社区插件 */
  partner_product?: PartnerProduct;
  /** 绑定的服务树 - 自营插件 */
  service_tree?: string;
}

export interface SKUAttrInfo {
  AttrKey?: string;
  AttrValue?: string;
}

export interface SKUEntity {
  sku_id?: string;
  attrs?: Array<SKUAttrInfo>;
  prices?: Array<marketplace_common.Price>;
  /** 订阅类商品才会有 */
  subscription_info?: SubscriptionExtra;
  /** sku名称，用于展示 */
  sku_title?: string;
}

/** 自动更新订阅 */
export interface SubscriptionAutoRenewSKU {
  /** 购买周期 */
  billing_period?: SubscriptionPeriod;
  /** 订阅整个周期数目(trail期和intro期也被计算在内),单位是一个SubscriptionPeriod。续费超过该次数后，不再继续续费。0或不输入均表示不限制。 */
  billing_period_count?: number;
  /** 折扣期 */
  trial_period?: SubscriptionPeriod;
  /** 折扣期次数（最小为1） */
  trial_period_count?: number;
  /** 宽限期 */
  grade_period?: SubscriptionPeriod;
}

/** 订阅类商品 sku 信息，需要与普通商品 sku 隔开 */
export interface SubscriptionExtra {
  subs_sku_type?: SubscribeSKUType;
  auto_renew_sku?: SubscriptionAutoRenewSKU;
  one_off_sku?: SubscriptionOneOffSKU;
  benefit_ids?: Array<Int64>;
  /** 订阅等级 */
  subscription_level?: number;
}

/** 一次性订阅 */
export interface SubscriptionOneOffSKU {
  billig_period?: SubscriptionPeriod;
}

export interface SubscriptionPeriod {
  /** 时间周期单位，YEAR/MONTH/DAY/HOUR/MINUTE/WEEK */
  unit?: string;
  /** 时间周期长度，单位是一个unit */
  length?: number;
  unit_type?: UnitType;
}

export interface UserInfo {
  user_id?: string;
  user_name?: string;
  name?: string;
  avatar_url?: string;
  user_label?: UserLabel;
  follow_type?: marketplace_common.FollowType;
}

export interface UserLabel {
  label_id?: string;
  label_name?: string;
  icon_uri?: string;
  icon_url?: string;
  jump_link?: string;
}
/* eslint-enable */
