import { create } from 'zustand';
import { produce } from 'immer';
import {
  type BizCtx,
  type MockSet,
  type MockSetBinding,
} from '@coze-arch/bot-api/debugger_api';
import { type BasicMockSetInfo } from '@coze-studio/mockset-shared';

import { isCurrent } from '../../util';

export interface EnabledMockSetInfo {
  mockSetBinding: MockSetBinding;
  mockSetDetail?: MockSet;
}

interface MockInfoStoreState {
  bizCtx: BizCtx;
  enabledMockSetInfo: Array<EnabledMockSetInfo>;
  isPolling: boolean;
  isLoading: boolean;
  currentMockComp: Array<BasicMockSetInfo>;
  timer?: NodeJS.Timeout;
  restartTimer?: NodeJS.Timeout;
}

interface MockInfoStoreAction {
  setPolling: (polling: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentBizCtx: (bizCtx: BizCtx) => void;
  setEnabledMockSetInfo: (mockSetList?: Array<EnabledMockSetInfo>) => void;
  removeMockComp: (mockComp: BasicMockSetInfo) => number;
  addMockComp: (mockComp: BasicMockSetInfo) => number;
  setTimer: (timer?: NodeJS.Timeout) => void;
  setRestartTimer: (timer?: NodeJS.Timeout) => void;
}

export const useMockInfoStore = create<
  MockInfoStoreState & MockInfoStoreAction
>((set, get) => ({
  bizCtx: {},
  enabledMockSetInfo: [],
  isPolling: false,
  isLoading: false,
  currentMockComp: [],
  setPolling: polling => {
    set({ isPolling: polling });
  },
  setLoading: loading => {
    set({ isLoading: loading });
  },
  setCurrentBizCtx: bizCtx => {
    set({ bizCtx });
  },
  setEnabledMockSetInfo: enabledMockSetInfo => {
    set({ enabledMockSetInfo });
  },
  addMockComp: mockSetInfo => {
    set(
      produce<MockInfoStoreState>(s => {
        const index = s.currentMockComp.findIndex(item =>
          isCurrent(item, mockSetInfo),
        );
        index <= -1 && s.currentMockComp.push(mockSetInfo);
      }),
    );
    return get().currentMockComp.length;
  },
  removeMockComp: mockSetInfo => {
    set(
      produce<MockInfoStoreState>(s => {
        const index = s.currentMockComp.findIndex(item =>
          isCurrent(item, mockSetInfo),
        );
        if (index > -1) {
          s.currentMockComp.splice(index, 1);
        }
      }),
    );
    return get().currentMockComp.length;
  },
  setTimer: timer => {
    set({ timer });
  },
  setRestartTimer: timer => {
    set({ timer });
  },
}));
