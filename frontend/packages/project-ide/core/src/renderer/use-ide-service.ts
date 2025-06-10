import { type interfaces } from 'inversify';

import { useIDEContainer } from './use-ide-container';

/**
 * 获取IDE的 IOC 模块
 * @param identifier
 */
export function useIDEService<T>(identifier: interfaces.ServiceIdentifier): T {
  const container = useIDEContainer();
  return container.get(identifier) as T;
}
