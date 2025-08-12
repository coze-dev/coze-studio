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

import { useShallow } from 'zustand/react/shallow';
import { useSpace } from '@coze-arch/foundation-sdk';

import { useSpaceAuthStore } from './store';

export function useSpaceRole(spaceId: string) {
  // Get space information, there are hooks.
  const space = useSpace(spaceId);

  if (!space) {
    throw new Error(
      'useSpaceAuth must be used after space list has been pulled.',
    );
  }

  const { isReady, role } = useSpaceAuthStore(
    useShallow(store => ({
      isReady: store.isReady[spaceId],
      role: store.roles[spaceId],
    })),
  );

  if (!isReady) {
    throw new Error(
      'useSpaceAuth must be used after useInitSpaceRole has been completed.',
    );
  }

  if (!role) {
    throw new Error(`Can not get space role of space: ${spaceId}`);
  }

  return role;
}
