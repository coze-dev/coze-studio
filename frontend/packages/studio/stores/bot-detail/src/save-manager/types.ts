/* eslint-disable @typescript-eslint/no-explicit-any */
import { ItemType } from '@coze-arch/bot-api/developer_api';

// 走自动保存update接口的scope服务端会维护ItemType，其他scope前端维护在ItemTypeExtra中
export enum ItemTypeExtra {
  MultiAgent = 1024,
  TTS = 1025,
  ConnectorType = 1026,
  ChatBackGround = 1027,
  Shortcut = 1028,
  QueryCollect = 1029,
  LayoutInfo = 1030,
  TaskInfo = 1031,
  TimeCapsule = 1032,
}

export type BizKey = ItemType | ItemTypeExtra | undefined;
export type ScopeStateType = any;
export { ItemType };
