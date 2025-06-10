/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ReportEventStatus {
  NotProcessed = 1,
  Processing = 2,
  Processed = 3,
}

export enum ReportObjectType {
  ProductBot = 1,
  ProductPlugin = 2,
  ProductWorkflow = 3,
  ProductImageFlow = 4,
  ProductSociety = 5,
  InteractionPost = 6,
  InteractionComment = 7,
  /** 模板举报 */
  TemplateBot = 8,
  TemplateWorkflow = 9,
  TemplateImageFlow = 10,
  TemplateProject = 11,
  /** Project 商品 */
  ProductProject = 12,
  /** 模板通用标识，由于前端不需要区分是哪一种模板，所以统一用这个进行筛选和展示
该配型不会触发任何举报的业务逻辑，仅用于前端展示使用 */
  TemplateCommon = 99,
}
/* eslint-enable */
