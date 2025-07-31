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

import { useState, useEffect } from 'react';

import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { type TableSettings } from '@coze-data/knowledge-resource-processor-base/types';
import { TableSettingBar } from '@coze-data/knowledge-resource-processor-base/components/table-format';
import { FIELD_TYPE_OPTIONS } from '@coze-data/database-v2-base/constants';
import { DatabaseFieldTitle } from '@coze-data/database-v2-base/components/database-field-title';
import { I18n } from '@coze-arch/i18n';
import {
  type TableType,
  type TableSheet,
  TableDataType,
  type GetDocumentTableInfoResponse,
  ColumnType,
  FieldItemType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { type ColumnProps, Spin, Table } from '@coze-arch/coze-design';

import { type TableFieldData } from '../../database-table-data/type';

type TableSettingsData = Pick<
  GetDocumentTableInfoResponse,
  'sheet_list' | 'preview_data'
>;

function tableSettingsToSheet(tableSettings: TableSettings): TableSheet {
  return {
    sheet_id: tableSettings?.sheet_id?.toString() ?? '',
    header_line_idx: tableSettings?.header_line_idx?.toString() ?? '',
    start_line_idx: tableSettings?.start_line_idx?.toString() ?? '',
  };
}

export interface StepConfigProps {
  databaseId: string;
  tableType: TableType;
  tableFields: TableFieldData[];
  fileUri: string;
  onTableSheetChange: (tableSheet?: TableSheet) => void;
}

export function StepConfig({
  databaseId,
  tableType,
  tableFields,
  fileUri,
  onTableSheetChange,
}: StepConfigProps) {
  const [tableData, setTableData] = useState<TableSettingsData>();
  // Default: Use the first data table, the first row is the header, and the second row starts with data
  const [tableSettings, setTableSettings] = useState<TableSettings>({
    sheet_id: 0,
    header_line_idx: 0,
    start_line_idx: 1,
  });
  const [tableStructure, setTableStructure] = useState<TableFieldData[]>([]);

  const { loading } = useRequest(
    () =>
      MemoryApi.GetTableSchema({
        database_id: databaseId,
        source_file: { tos_uri: fileUri },
        table_data_type: TableDataType.OnlySchema,
        table_sheet: tableSettingsToSheet(tableSettings),
      }),
    {
      refreshDeps: [fileUri, tableSettings],
      onSuccess: res => {
        setTableData({
          sheet_list: res.sheet_list,
          preview_data: {}, // TableSettingBar does not read preview_data, but it is not empty
        });
        if (res.table_meta) {
          setTableStructure(
            res.table_meta.map(column => {
              // When there are fields with the same name in the table structure, use the original type and description
              const matchedField = tableFields.find(
                field => field.fieldName === column.column_name,
              );
              return (
                matchedField ??
                ({
                  fieldName: column.column_name ?? '-',
                  fieldDescription: column.desc ?? '-',
                  type: convertColumnType(column.column_type),
                  required: false,
                } satisfies TableFieldData)
              );
            }),
          );
        }
      },
    },
  );

  useEffect(() => {
    MemoryApi.ValidateTableSchema({
      database_id: databaseId,
      source_file: { tos_uri: fileUri },
      table_type: tableType,
      table_sheet: tableSettingsToSheet(tableSettings),
    })
      .then(res => {
        if (!res.schema_valid_result) {
          onTableSheetChange(tableSettingsToSheet(tableSettings));
        } else {
          onTableSheetChange();
        }
      })
      .catch(() => {
        onTableSheetChange();
      });
  }, [tableSettings]);

  return !tableData ? (
    <Spin size="large" wrapperClassName="w-full h-[288px]" />
  ) : (
    <>
      <TableSettingBar
        data={tableData}
        tableSettings={tableSettings}
        setTableSettings={setTableSettings}
      />
      <Table
        tableProps={{
          loading,
          columns: getTableStructureColumns(),
          dataSource: tableStructure,
        }}
        className={classNames(
          '[&_.semi-table-row-head]:!border-b-[1px]',
          '[&_.semi-table-row-cell]:!h-[56px]',
          '[&_.semi-table-row-cell]:!border-b-0',
          '[&_.semi-table-row-cell]:!bg-none',
          '[&_.semi-table-row-cell]:!bg-transparent',
        )}
      />
    </>
  );
}

function convertColumnType(type?: ColumnType): FieldItemType {
  switch (type) {
    case ColumnType.Text:
      return FieldItemType.Text;
    case ColumnType.Number:
      return FieldItemType.Number;
    case ColumnType.Date:
      return FieldItemType.Date;
    case ColumnType.Float:
      return FieldItemType.Float;
    case ColumnType.Boolean:
      return FieldItemType.Boolean;
    default:
      return FieldItemType.Text;
  }
}

function getTableStructureColumns(): ColumnProps<TableFieldData>[] {
  return [
    {
      title: <DatabaseFieldTitle field={I18n.t('db_add_table_field_name')} />,
      render: (_, record) => record.fieldName,
    },
    {
      title: <DatabaseFieldTitle field={I18n.t('db_add_table_field_desc')} />,
      render: (_, record) => record.fieldDescription,
    },
    {
      title: <DatabaseFieldTitle field={I18n.t('db_add_table_field_type')} />,
      render: (_, record) =>
        FIELD_TYPE_OPTIONS.find(i => i.value === record.type)?.label ?? '-',
    },
  ];
}
