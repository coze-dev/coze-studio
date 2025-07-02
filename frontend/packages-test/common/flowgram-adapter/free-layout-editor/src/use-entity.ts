import { useLayoutEffect } from 'react';

import {
  type Entity,
  EntityManager,
  type EntityRegistry,
  usePlaygroundContainer,
  useRefresh,
} from '@flowgram.ai/free-layout-editor';

/**
 * 获取 entity 并监听变化
 * 请使用 useConfigEntity 替代
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
