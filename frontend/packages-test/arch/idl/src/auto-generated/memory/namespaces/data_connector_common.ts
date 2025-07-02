/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum DataSourceType {
  Notion = 1,
  GoogleDrive = 2,
  FeishuWeb = 103,
  LarkWeb = 104,
  WeChat = 109,
}

export enum FileNodeType {
  Folder = 1,
  Document = 2,
  Sheet = 3,
  Space = 4,
}

export enum FileStatus {
  Initialized = 1,
  Processing = 2,
  Success = 3,
  Failed = 4,
  UnAssociated = 5,
}

export enum SourceFileType {
  Markdown = 1,
  Excel = 2,
}

export enum UserPolicyAction {
  Agree = 0,
  Disagree = 1,
}
/* eslint-enable */
