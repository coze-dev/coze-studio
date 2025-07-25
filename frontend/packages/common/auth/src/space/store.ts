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
import { type SpaceRoleType } from '@coze-arch/idl/developer_api';

interface SpaceAuthStoreState {
  // 每一个空间的角色数据
  roles: {
    [spaceId: string]: SpaceRoleType[];
  };
  // 每一个空间的角色数据的初始化状态，是否完成初始化。
  isReady: {
    [spaceId: string]: boolean;
  };
}

interface SpaceAuthStoreAction {
  // 设置spaceId对应的空间的角色
  setRoles: (spaceId: string, roles: SpaceRoleType[]) => void;
  // 设置spaceId对应的空间的数据是否ready
  setIsReady: (spaceId: string, isReady: boolean) => void;
  // 回收空间数据
  destory: (spaceId) => void;
}
/**
 * SpaceAuthStore设计成支持多空间切换，维护多个空间的数据，位置因为空间切换时序导致的bug。
 */
export const useSpaceAuthStore = create<
  SpaceAuthStoreState & SpaceAuthStoreAction
>()(
  devtools(
    set => ({
      roles: {},
      isReady: {},
      setRoles: (spaceId, roles) =>
        set(state => ({
          roles: {
            ...state.roles,
            [spaceId]: roles,
          },
        })),
      setIsReady: (spaceId, isReady) =>
        set(state => ({ isReady: { ...state.isReady, [spaceId]: isReady } })),
      destory: spaceId =>
        set(state => ({
          roles: { ...state.roles, [spaceId]: [] },
          isReady: { ...state.isReady, [spaceId]: undefined },
        })),
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.spaceAuthStore',
    },
  ),
);
