/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import {
  Branch,
  type GetDraftBotInfoAgwData,
} from '@coze-arch/idl/playground_api';
import { type BotCollaboratorStatus } from '@coze-arch/idl/developer_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';

export const getDefaultCollaborationStore = (): CollaborationStore => ({
  inCollaboration: false,
  sameWithOnline: false,
  committer_name: '',
  editLockStatus: EditLockStatus.Offline,
  collaboratorStatus: {
    commitable: false,
    operateable: false,
    manageable: false,
  },
  baseVersion: '',
  branch: Branch.Base,
  commit_time: '',
  commit_version: '',
  openCollaboratorsEnable: false,
  canUpgrade: false,
  currentCollaborationBotCount: 0,
  maxCollaborationBotCount: 0,
  maxCollaboratorsCount: 0,
});
export enum EditLockStatus {
  Lose, // 无编辑锁
  Holder, // 有编辑锁
  Offline, // 断网状态，可编辑，但是不可保存。避免联网后覆盖掉断网期间其他页面的编辑
}
/**多人协作*/
export interface CollaborationStore {
  editLockStatus: EditLockStatus;
  inCollaboration: boolean;
  collaboratorStatus: BotCollaboratorStatus;
  sameWithOnline: boolean;
  baseVersion: string;
  /** for前端，最近一次的提交人 */
  committer_name: string;
  /** 获取的是什么分支的内容 */
  branch?: Branch;
  /** for前端，提交时间 */
  commit_time: string;
  commit_version: string;
  /** 能否开启协作开关 false不可开启 */
  openCollaboratorsEnable: boolean;
  /** 是否可升级套餐 顶级付费账号不可升级 */
  canUpgrade: boolean;
  // 当前开启的协作bot数量
  currentCollaborationBotCount: number;
  /** 用户最大开启多人协作bot的数量限制 */
  maxCollaborationBotCount: number;
  /** 协作者数量上限 */
  maxCollaboratorsCount: number;
}

export interface CollaborationAction {
  setCollaboration: SetterAction<CollaborationStore>;
  setCollaborationByImmer: (
    update: (state: CollaborationStore) => void,
  ) => void;
  getBaseVersion: () => string | undefined;
  initStore: (data: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useCollaborationStore = create<
  CollaborationStore & CollaborationAction
>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultCollaborationStore(),
      setCollaboration: setterActionFactory<CollaborationStore>(set),
      setCollaborationByImmer: update =>
        set(produce<CollaborationStore>(state => update(state))),
      getBaseVersion: () => {
        const { baseVersion, inCollaboration } = get();
        // FG开启且单人模式下，不提供 base_version
        if (!inCollaboration) {
          return undefined;
        }
        return baseVersion;
      },
      initStore: info => {
        set({
          collaboratorStatus: info?.collaborator_status,
          inCollaboration: info.in_collaboration,
          baseVersion: info.commit_version,
          sameWithOnline: info?.same_with_online,
          committer_name: info?.committer_name,
          commit_version: info?.commit_version,
          branch: info?.branch,
          commit_time: info?.commit_time,
        });
      },
      clear: () => {
        set({ ...getDefaultCollaborationStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.collaboration',
    },
  ),
);
