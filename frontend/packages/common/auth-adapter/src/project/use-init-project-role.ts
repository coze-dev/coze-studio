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

import { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useProjectAuthStore, ProjectRoleType } from '@coze-common/auth';

export function useInitProjectRole(spaceId: string, projectId: string) {
  const { setIsReady, setRoles, isReady } = useProjectAuthStore(
    useShallow(store => ({
      isReady: store.isReady[projectId],
      setIsReady: store.setIsReady,
      setRoles: store.setRoles,
    })),
  );

  useEffect(() => {
    setRoles(projectId, [ProjectRoleType.Owner]);
    setIsReady(projectId, true);
  }, [projectId]);

  return isReady; // Whether the initialization is complete.
}
