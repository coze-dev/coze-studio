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

import { useMemo, useState } from 'react';

import { useRequest } from 'ahooks';
import {
  type TableInfo,
  type TableSettings,
} from '@coze-data/knowledge-resource-processor-base/types';
import { TablePreview } from '@coze-data/knowledge-resource-processor-base/components/table-format';
import {
  type TableSheet,
  type DocTableColumn,
  TableDataType,
} from '@coze-arch/bot-api/memory';
import { ColumnType } from '@coze-arch/bot-api/knowledge';
import { FieldItemType } from '@coze-arch/bot-api/developer_api';
import { MemoryApi } from '@coze-arch/bot-api';
import { Spin } from '@coze-arch/coze-design';

import { type TableFieldData } from '../../database-table-data/type';

function convertFieldItemType(type?: FieldItemType): ColumnType {
  switch (type) {
    case FieldItemType.Text:
      return ColumnType.Text;
    case FieldItemType.Number:
      return ColumnType.Number;
    case FieldItemType.Date:
      return ColumnType.Date;
    case FieldItemType.Float:
      return ColumnType.Float;
    case FieldItemType.Boolean:
      return ColumnType.Boolean;
    default:
      return ColumnType.Text;
  }
}

function tableSheetToSettings(tableSheet: TableSheet): TableSettings {
  return {
    sheet_id: Number.parseInt(tableSheet?.sheet_id ?? '0'),
    header_line_idx: Number.parseInt(tableSheet?.header_line_idx ?? '0'),
    start_line_idx: Number.parseInt(tableSheet?.start_line_idx ?? '0'),
  };
}

export interface StepPreviewProps {
  databaseId: string;
  tableFields: TableFieldData[];
  fileUri: string;
  tableSheet?: TableSheet;
}

export function StepPreview({
  databaseId,
  tableFields,
  fileUri,
  tableSheet,
}: StepPreviewProps) {
  const [tableInfo, setTableInfo] = useState<TableInfo>();
  const tableMeta: DocTableColumn[] = useMemo(
    () =>
      tableFields.map((field, index) => ({
        column_name: field.fieldName,
        column_type: convertFieldItemType(field.type),
        desc: field.fieldDescription,
        sequence: `${index}`,
        is_semantic: false,
        id: `${index}`,
      })),
    [tableFields],
  );

  const { loading } = useRequest(
    () =>
      MemoryApi.GetTableSchema({
        database_id: databaseId,
        source_file: { tos_uri: fileUri },
        table_data_type: TableDataType.OnlyPreview,
        table_sheet: tableSheet,
      }),
    {
      onSuccess: res => {
        const sheetId = tableSheet?.sheet_id;
        if (sheetId) {
          setTableInfo({
            sheet_list: res.sheet_list,
            table_meta: { [sheetId]: tableMeta },
            preview_data: { [sheetId]: res.preview_data ?? [] },
          });
        }
      },
    },
  );

  return loading || !tableInfo || !tableSheet ? (
    <Spin size="large" wrapperClassName="w-full h-[288px]" />
  ) : (
    <TablePreview
      data={tableInfo}
      settings={tableSheetToSettings(tableSheet)}
    />
  );
}
