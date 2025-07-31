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
 * Get the query for the current database
 * @Returns database query results
 *  - data: returns the database object when the query is successful, returns undefined when there is no data
 *  - isLoading: Loading status
 *  - error: the error object when the query fails
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
          // When a database resource is updated, rerequest the interface
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
