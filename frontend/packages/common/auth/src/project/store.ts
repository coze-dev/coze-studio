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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type ProjectRoleType } from './constants';

interface ProjectAuthStoreState {
  // Role Data for Each Project
  roles: {
    [projectId: string]: ProjectRoleType[];
  };
  // The initialization status of each Project's role data, and whether the initialization has been completed.
  isReady: {
    [projectId: string]: boolean;
  };
}

interface SpaceAuthStoreAction {
  // Set the role of the Project corresponding to the projectId
  setRoles: (projectId: string, role: ProjectRoleType[]) => void;
  // Set whether the data of the Project corresponding to the projectId is ready
  setIsReady: (projectId: string, isReady: boolean) => void;
  // Recovering Project Data
  destory: (projectId) => void;
}
/**
 * ProjectAuthStore is designed to support multi-project switching, maintain data of multiple projects, and prevent bugs caused by project switching timing.
 */
export const useProjectAuthStore = create<
  ProjectAuthStoreState & SpaceAuthStoreAction
>()(
  devtools(
    set => ({
      roles: {},
      isReady: {},
      setRoles: (projectId, roles) =>
        set(state => ({
          roles: {
            ...state.roles,
            [projectId]: roles,
          },
        })),
      setIsReady: (projectId, isReady) =>
        set(state => ({ isReady: { ...state.isReady, [projectId]: isReady } })),
      destory: projectId =>
        set(state => ({
          roles: { ...state.roles, [projectId]: [] },
          isReady: { ...state.isReady, [projectId]: false },
        })),
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.projectAuthStore',
    },
  ),
);
