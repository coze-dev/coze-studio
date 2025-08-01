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
  Lose, // No edit lock
  Holder, // There is edit lock.
  Offline, // The network disconnection status can be edited, but cannot be saved. Avoid overwriting the editing of other pages during the disconnection period after networking.
}
/**multiplayer collaboration*/
export interface CollaborationStore {
  editLockStatus: EditLockStatus;
  inCollaboration: boolean;
  collaboratorStatus: BotCollaboratorStatus;
  sameWithOnline: boolean;
  baseVersion: string;
  /** For the front end, the most recent author */
  committer_name: string;
  /** What branch did you get the content of? */
  branch?: Branch;
  /** For frontend, commit time */
  commit_time: string;
  commit_version: string;
  /** Can it be turned on? The cooperation switch is false and cannot be turned on. */
  openCollaboratorsEnable: boolean;
  /** Whether the package can be upgraded, the top paid account cannot be upgraded */
  canUpgrade: boolean;
  // The current number of active collaboration bots
  currentCollaborationBotCount: number;
  /** Limit on the maximum number of user-enabled multiplayer collaborative bots */
  maxCollaborationBotCount: number;
  /** maximum number of collaborators */
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
        // FG is on and in single mode, no base_version is provided
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
