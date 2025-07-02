import { type DocumentStatus } from '@coze-arch/bot-api/knowledge';

export interface ProgressItem {
  status: DocumentStatus;
  progress: number;
}
export type ProgressMap = Record<string, ProgressItem>;

export enum ActionType {
  ADD = 'add',
  REMOVE = 'remove',
}

export enum FilterPhotoType {
  /**
   * 全部
   */
  All = 'All',
  /**
   * 已标注
   */
  HasCaption = 'HasCaption',
  /**
   * 未标注
   */
  NoCaption = 'NoCaption',
}
