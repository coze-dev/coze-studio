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

import { useLayoutEffect } from 'react';

import {
  type Entity,
  EntityManager,
  type EntityRegistry,
  usePlaygroundContainer,
  useRefresh,
} from '@flowgram.ai/free-layout-editor';

/**
 * Get entities and listen for changes
 * Please use useConfigEntity instead
 * @deprecated
 */
export function useEntity<T extends Entity>(
  entityRegistry: EntityRegistry,
  autoCreate = true,
): T {
  const entityManager = usePlaygroundContainer().get(EntityManager);
  const entity = entityManager.getEntity<T>(entityRegistry, autoCreate) as T;
  const refresh = useRefresh(entity.version);
  useLayoutEffect(() => {
    const dispose = entity.onEntityChange(() => {
      refresh(entity.version);
    });
    return () => dispose.dispose();
  }, [entityManager, refresh, entity]);
  return entity;
}
