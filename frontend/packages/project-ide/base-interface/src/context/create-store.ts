import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type UseBoundStore, type StoreApi } from 'zustand';
import {
  type User,
  type IntelligenceBasicInfo,
  type IntelligencePublishInfo,
} from '@coze-arch/bot-api/intelligence_api';

interface CreateStoreOptions {
  spaceId: string;
  projectId: string;
  version: string;
}

export interface IDEGlobalState {
  /**
   * 项目 id
   */
  projectId: string;
  /**
   * 空间 id
   */
  spaceId: string;

  version: string;

  /**
   * get_draft_intelligence_info 接口返回内容
   */
  projectInfo?: {
    ownerInfo?: User;
    projectInfo?: IntelligenceBasicInfo;
    publishInfo?: IntelligencePublishInfo;
  };
}

export interface IDEGlobalAction {
  patch: (next: Partial<IDEGlobalState>) => void;
}

export type StoreContext = UseBoundStore<
  StoreApi<IDEGlobalState & IDEGlobalAction>
>;

export const createStore = (options: CreateStoreOptions) =>
  createWithEqualityFn<IDEGlobalState & IDEGlobalAction>(
    set => ({
      spaceId: options.spaceId,
      projectId: options.projectId,
      version: options.version,
      patch: next => set(() => next),
    }),
    shallow,
  );
