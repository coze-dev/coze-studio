/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum TaskStatus {
  TaskStatusDoing = 1,
  TaskStatusSuccess = 2,
  TaskStatusFail = 3,
  TaskStatusCancel = 4,
}

/** 这是intelligence自己定义的任务类型，在intelligence中转成task任务类型，最好废弃，直接使用task任务类型 */
export enum TaskType {
  /** 草稿 --> 草稿 */
  TaskTypeProjectCopy = 1,
  /** TaskTypeBotCopy = 2
从模板来的  线上版本 --> 草稿 */
  TaskTypeCopyTemplateToProject = 3,
  /** 发布成线上 */
  TaskTypePublishProject = 4,
  /** 发布成模板 */
  TaskTypePublishTemplate = 5,
  /** 模板上架复制模板 */
  TaskTypeLaunchProjectTemplate = 6,
  /** 存档 */
  TaskTypeArchiveProject = 7,
  /** 回滚 */
  TaskTypeRollbackProject = 8,
  /** Project跨空间复制 */
  TaskTypeCrossSpaceCopyProject = 9,
  /** Resource跨空间复制 */
  TaskTypeCrossSpaceCopyResource = 10,
}
/* eslint-enable */
