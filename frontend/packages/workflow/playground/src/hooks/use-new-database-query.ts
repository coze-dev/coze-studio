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
import { type WorkflowDatabase, ViewVariableType } from '@coze-workflow/base';
import { FieldItemType, type DatabaseInfo } from '@coze-arch/bot-api/memory';

import { useDatabaseServiceStore } from './use-database-node-service';

/**
 * 查询数据库信息的Hook
 * @param id 数据库ID
 * @returns 返回对象包含:
 *  - data: 查询成功时返回数据库信息，无数据时返回undefined
 *  - isLoading: 加载状态
 *  - error: 查询失败时的错误对象
 */
export function useNewDatabaseQuery(id?: string) {
  const { getDatabaseDetail, isLoading, getError } = useDatabaseServiceStore(
    useShallow(state => ({
      getDatabaseDetail: state.getData,
      isLoading: state.loading,
      getError: state.getError,
    })),
  );
  const rawData = getDatabaseDetail(id);
  const data = transformRawDatabaseToDatabase(rawData?.database_info);

  return { data, isLoading, error: getError(id) };
}

function transformRawDatabaseToDatabase(
  rawDatabase?: DatabaseInfo,
): WorkflowDatabase | undefined {
  if (!rawDatabase) {
    return undefined;
  }

  return {
    id: rawDatabase.id as string,
    fields: rawDatabase.field_list?.map(field => ({
      id: field.alterId as number,
      name: field.name,
      // @ts-expect-error fix me late
      type: fieldItemTypeToViewVariableType(field.type),
      required: field.must_required,
      description: field.desc,
      isSystemField: field.name
        ? ['id', 'uuid', 'bstudio_create_time'].includes(field.name)
        : false,
    })),
    iconUrl: rawDatabase.icon_url,
    tableName: rawDatabase.table_name,
  };
}

function fieldItemTypeToViewVariableType(type?: FieldItemType) {
  const typeMap = {
    [FieldItemType.Text]: ViewVariableType.String,
    [FieldItemType.Number]: ViewVariableType.Integer,
    [FieldItemType.Float]: ViewVariableType.Number,
    [FieldItemType.Boolean]: ViewVariableType.Boolean,
    [FieldItemType.Date]: ViewVariableType.Time,
  };

  if (!type) {
    return undefined;
  }

  return typeMap[type] || undefined;
}
