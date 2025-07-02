import { create } from 'zustand';
import { noop } from 'lodash-es';
import { type DatabaseInfo } from '@coze-studio/bot-detail-store';

export interface initialConfigStore {
  onCancel: () => void;
  botId: string;
  spaceId: string;
  maxColumnNum: number;
  onSave?: (params: {
    response: any;
    stateData: DatabaseInfo;
  }) => Promise<void>;
}

// 用来存储静态状态，非初始化场景下，仅只读不可修改
export const useInitialConfigStore = create<initialConfigStore>()(set => ({
  onCancel: noop,
  botId: '',
  spaceId: '',
  maxColumnNum: 10,
}));
