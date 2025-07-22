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
 
/**
 * @file 开源版暂时不提供权限控制功能，本文件中导出的方法用于未来拓展使用。
 */

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';
import { useSpaceAuthStore } from '@coze-common/auth';

export function useInitSpaceRole(spaceId: string) {
  const { setIsReady, setRoles, isReady } = useSpaceAuthStore(
    useShallow(store => ({
      setIsReady: store.setIsReady,
      setRoles: store.setRoles,
      isReady: store.isReady[spaceId],
    })),
  );

  useEffect(() => {
    setRoles(spaceId, [SpaceRoleType.Owner]);
    setIsReady(spaceId, true);
  }, [spaceId]);

  return isReady;
}
