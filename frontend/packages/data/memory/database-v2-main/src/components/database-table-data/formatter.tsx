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

import classNames from 'classnames';
import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import {
  SYSTEM_FIELDS,
  SYSTEM_FIELD_ROW_INDEX,
} from '@coze-data/database-v2-base/constants';
import { DatabaseFieldTitle } from '@coze-data/database-v2-base/components/database-field-title';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import {
  type ColumnProps,
  IconButton,
  Popconfirm,
  Space,
  Typography,
} from '@coze-arch/coze-design';
import { FieldItemType } from '@coze-arch/bot-api/memory';

import { type TableRow, type TableField, type TableFieldData } from './type';

export function formatTableStructList(
  structList: TableMemoryItem[],
): TableFieldData[] {
  // @ts-expect-error fix me late
  return structList.map(item => ({
    fieldName: item.name ?? '',
    fieldDescription: item.desc ?? '',
    required: item.must_required ?? false,
    type: item.type ?? FieldItemType.Text,
  }));
}

export function formatTableDataRow(
  structList: TableFieldData[],
  dataRow: Record<string, string>[],
): TableRow[] {
  return dataRow.map(_data => {
    const dataRowFieldList = Object.keys(_data);
    const formattedDataRow: TableRow = {};
    dataRowFieldList.forEach(_key => {
      const structItem = structList.find(i => i.fieldName === _key);
      if (!structItem) {
        // 系统字段
        formattedDataRow[_key] = {
          fieldName: _key,
          type: FieldItemType.Text,
          required: true,
          value: _data[_key as unknown as number],
        };
        return;
      }

      switch (structItem.type) {
        case FieldItemType.Boolean:
          formattedDataRow[_key] = {
            fieldName: _key,
            value: _data[_key as unknown as number] as unknown as boolean,
            type: FieldItemType.Boolean,
            required: structItem.required,
          };
          break;
        case FieldItemType.Number:
          formattedDataRow[_key] = {
            fieldName: _key,
            value: _data[_key as unknown as number] as unknown as number,
            type: FieldItemType.Number,
            required: structItem.required,
          };
          break;
        case FieldItemType.Date:
          formattedDataRow[_key] = {
            fieldName: _key,
            value: _data[_key as unknown as number] as unknown as string,
            type: FieldItemType.Date,
            required: structItem.required,
          };
          break;
        case FieldItemType.Float:
          formattedDataRow[_key] = {
            fieldName: _key,
            value: _data[_key as unknown as number] as unknown as string,
            type: FieldItemType.Float,
            required: structItem.required,
          };
          break;
        case FieldItemType.Text:
          formattedDataRow[_key] = {
            fieldName: _key,
            value: _data[_key as unknown as number] as unknown as string,
            type: FieldItemType.Text,
            required: structItem.required,
          };
          break;
        default:
          break;
      }
    });

    return formattedDataRow;
  });
}

const SystemFieldWidth: Record<string, number | undefined> = {
  id: 200,
  sys_platform: 180,
  uuid: 260,
  bstudio_create_time: 200,
};

interface GetTableColumnsParams {
  fieldList: TableFieldData[];
  connectorNames: Record<string, string>;
  isReadonlyMode: boolean;
  handleEditRow: (row: TableRow) => void;
  handleDeleteRow: (row: TableRow) => void;
}

interface DatabaseTableCellProps {
  value?: string | number | boolean;
}

function DatabaseTableCell({ value }: DatabaseTableCellProps) {
  const stringValue = value?.toString() ?? '';

  return (
    <Typography.Text
      ellipsis={{
        showTooltip: {
          opts: {
            className: classNames(
              '[&_.semi-tooltip-content]:max-h-[110px]',
              '[&_.semi-tooltip-content]:line-clamp-5',
            ),
          },
        },
      }}
    >
      {stringValue}
    </Typography.Text>
  );
}

/**
 * 获取 Table Field 表头数据
 */
export const getTableColumns = ({
  fieldList,
  connectorNames,
  isReadonlyMode,
  handleEditRow,
  handleDeleteRow,
}: GetTableColumnsParams) => {
  const columns: ColumnProps<TableRow>[] = [];

  // 系统字段列
  columns.push(
    ...SYSTEM_FIELDS.map(item => ({
      title: () => (
        <DatabaseFieldTitle
          field={item.name}
          // @ts-expect-error fix me late
          type={item.type}
          tip={item.desc}
          required
        />
      ),
      dataIndex: SYSTEM_FIELD_ROW_INDEX[item.name ?? ''],
      width: SystemFieldWidth[item.name ?? ''] ?? 260,
      render: (field: TableField) =>
        field.fieldName === 'bstudio_connector_id' ? (
          <Typography.Text ellipsis>
            {connectorNames[field.value as string] ?? field.value}
          </Typography.Text>
        ) : (
          <DatabaseTableCell value={field.value} />
        ),
    })),
  );

  // 用户字段列
  columns.push(
    ...fieldList.map(item => ({
      title: () => (
        <DatabaseFieldTitle
          field={item.fieldName}
          type={item.type}
          tip={item.fieldDescription}
          required={item.required}
        />
      ),
      dataIndex: item.fieldName,
      width: 260,
      render: (field: TableField) => <DatabaseTableCell value={field?.value} />,
    })),
  );

  // 操作列
  columns.push({
    title: I18n.t('db_table_0126_021'),
    width: 100,
    resize: false,
    fixed: 'right',
    render: (_: TableField, row: TableRow, _index: number) =>
      isReadonlyMode ? (
        <Space>
          <IconButton
            disabled
            icon={<IconCozEdit />}
            size="small"
            color="secondary"
          />
          <IconButton
            disabled
            icon={<IconCozTrashCan />}
            size="small"
            color="secondary"
          />
        </Space>
      ) : (
        <Space>
          <IconButton
            icon={<IconCozEdit />}
            size="default"
            color="secondary"
            onClick={() => handleEditRow(row)}
          />
          <Popconfirm
            title={I18n.t('db_optimize_026')}
            content={I18n.t('db_optimize_027')}
            okText={I18n.t('db_optimize_028')}
            okButtonColor="red"
            cancelText={I18n.t('db_optimize_029')}
            onConfirm={() => handleDeleteRow(row)}
          >
            <IconButton
              icon={<IconCozTrashCan />}
              size="default"
              color="secondary"
            />
          </Popconfirm>
        </Space>
      ),
  });

  return columns;
};
