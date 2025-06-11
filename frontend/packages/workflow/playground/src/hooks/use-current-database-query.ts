import { useEffect, useRef } from 'react';

import { MessageBizType } from '@coze-arch/idl/workflow_api';
import type { Disposable } from '@flowgram-adapter/common';

import { useNewDatabaseQuery } from './use-new-database-query';
import { useDependencyService } from './use-dependency-service';
import { useDatabaseNodeService } from './use-database-node-service';
import { useCurrentDatabaseID } from './use-current-database-id';

/**
 * 获取当前数据库的查询
 * @returns 返回数据库查询结果
 *  - data: 查询成功时返回数据库对象，无数据时返回undefined
 *  - isLoading: 加载状态
 *  - error: 查询失败时的错误对象
 */
export function useCurrentDatabaseQuery() {
  const currentDatabaseID = useCurrentDatabaseID();
  const { data, isLoading, error } = useNewDatabaseQuery(currentDatabaseID);
  const disposeRef: React.MutableRefObject<Disposable | null> =
    useRef<Disposable>(null);
  const databaseNodeService = useDatabaseNodeService();
  const dependencyService = useDependencyService();

  useEffect(() => {
    databaseNodeService.load(currentDatabaseID);
    if (!disposeRef.current) {
      disposeRef.current = dependencyService.onDependencyChange(source => {
        if (source?.bizType === MessageBizType.Database) {
          // 数据库资源更新时，重新请求接口
          databaseNodeService.load(currentDatabaseID);
        }
      });
    }
    return () => {
      disposeRef?.current?.dispose?.();
      disposeRef.current = null;
    };
  }, [currentDatabaseID]);

  return { data, isLoading, error };
}
