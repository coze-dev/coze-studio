import * as marketplace_common from './../marketplace_common';
export { marketplace_common };
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
}
export enum SortType {
  Heat = 1,
  Newest = 2,
  /** 收藏时间 */
  FavoriteTime = 3,
  /** 相关性，只用于搜索场景 */
  Relative = 4,
}
export enum ProductPublishMode {
  OpenSource = 1,
  ClosedSource = 2,
}
export enum ProductListSource {
  /** 推荐列表页 */
  Recommend = 1,
  /** 个性化推荐 */
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
  /** 从未上架 */
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
export type AuditStatus = ProductDraftStatus;
export interface OpeningDialog {
  /** Bot开场白 */
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
export enum SocialSceneRoleType {
  Host = 1,
  PresetBot = 2,
  Custom = 3,
}
export enum UIPreviewType {
  /**
   * UI 预览类型，定义对齐 UI Builder，目前用于 Project
   * 网页端
  */
  Web = 1,
  /** 移动端 */
  Client = 2,
}
export interface ChargeSKUExtra {
  quantity: string,
  is_self_define: boolean,
}
export enum FavoriteListSource {
  /** 用户自己创建的 */
  CreatedByMe = 1,
}
export interface FavoriteEntity {
  entity_id: string,
  entity_type: ProductEntityType,
  name: string,
  icon_url: string,
  description: string,
  /** 废弃，使用UserInfo */
  seller: SellerInfo,
  /** 用于跳转到Bot编辑页 */
  space_id: string,
  /** 用户是否有该实体所在Space的权限 */
  has_space_permission: boolean,
  /** 收藏时间 */
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