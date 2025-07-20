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
