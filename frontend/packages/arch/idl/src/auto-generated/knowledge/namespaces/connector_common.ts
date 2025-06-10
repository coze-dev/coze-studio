/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ConnectionStatus {
  enable = 1,
  delete = 2,
  expire = 3,
}

export enum ConnectorID {
  Notion = 101,
  GoogleDrive = 102,
  FeishuWeb = 103,
  DestinationTos = 104,
  LarkWeb = 105,
  WeChat = 109,
}

export enum DocSourceType {
  DocSourceTypeDrive = 1,
  DocSourceTypeWiki = 2,
  DocSourceTypeWeChat = 3,
}

export enum FileNodeType {
  Folder = 1,
  Document = 2,
  Sheet = 3,
  Space = 4,
}
/* eslint-enable */
