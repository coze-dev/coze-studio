/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum InputType {
  TextInput = 0,
  Select = 1,
  UploadImage = 2,
  UploadDoc = 3,
  UploadTable = 4,
  UploadAudio = 5,
  MixUpload = 6,
  VIDEO = 7,
  ARCHIVE = 8,
  CODE = 9,
  TXT = 10,
  PPT = 11,
}

export enum SendType {
  /** 直接发query */
  SendTypeQuery = 0,
  /** 使用面板 */
  SendTypePanel = 1,
}

export enum ToolType {
  /** 使用WorkFlow */
  ToolTypeWorkFlow = 1,
  /** 使用插件 */
  ToolTypePlugin = 2,
}
/* eslint-enable */
