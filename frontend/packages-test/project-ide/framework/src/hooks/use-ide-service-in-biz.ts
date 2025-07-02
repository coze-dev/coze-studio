import { type interfaces } from 'inversify';
import { useIDEContainer } from '@coze-project-ide/client';

/**
 * 获取 IDE 的 IOC 模块
 * 和 flow-ide/client 包内容相同，但可以支持在业务侧如 workflow 内调用
 * @param identifier
 */
export function useIDEServiceInBiz<T>(
  identifier: interfaces.ServiceIdentifier,
): T | undefined {
  const container = useIDEContainer();
  if (container.isBound(identifier)) {
    return container.get(identifier) as T;
  } else {
    return undefined;
  }
}
