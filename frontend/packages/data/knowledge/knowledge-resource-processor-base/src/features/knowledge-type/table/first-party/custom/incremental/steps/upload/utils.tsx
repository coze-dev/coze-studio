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

import { getDataTypeText } from '@coze-data/utils';
import { FooterBtnStatus } from '@coze-data/knowledge-resource-processor-core';
import {
  TextRender,
  type TableViewRecord,
  ImageRender,
  ActionsRender,
} from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { Typography } from '@coze-arch/bot-semi';
import {
  type DocTableColumn,
  type GetDocumentTableInfoResponse,
  ColumnType,
} from '@coze-arch/bot-api/memory';
import { Tag } from '@coze-arch/coze-design';

import { getSrcFromImg } from '@/utils/table';

import styles from './index.module.less';

const MAX_WIDTH = 1400;
const MIN_WIDTH = 200;
const DIFF_WIDTH = 397;

export function transformTableData<T>(
  tableColumns: T[],
  indexName: string,
  valueName?: string,
) {
  const tableDataItem: Record<string, string> = {};
  tableColumns.forEach(column => {
    const key = column[indexName as keyof T] as string;
    const value = valueName ? (column[valueName as keyof T] as string) : '';
    tableDataItem[key] = value;
  });

  return [tableDataItem];
}

export interface TableDataCleaningParams {
  data: GetDocumentTableInfoResponse;
  handleEdit: (record: TableViewRecord, index: number) => void;
  handleDel: (indexList: number[]) => void;
  handleCellUpdate: (record: TableViewRecord, index: number) => void;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

const ColumnTypeComp = (props: { columnType: ColumnType }) => (
  <Tag color="primary" className={styles['column-type']}>
    {getDataTypeText(props.columnType)}
  </Tag>
);

export function tableDataCleaning({
  data,
  handleEdit,
  handleDel,
  handleCellUpdate,
  tableContainerRef,
}: TableDataCleaningParams) {
  const defaultData = {
    sheetStructure: [],
    tableColumns: [],
    tableData: [],
  };

  if (!data) {
    return defaultData;
  }
  const { table_meta, sheet_list } = data;

  if (!table_meta || !Object.keys(table_meta).length || !sheet_list?.length) {
    return defaultData;
  }

  const curSubSheet = sheet_list[0];
  const curSheetStructure = table_meta[curSubSheet?.id ?? ''] || [];
  const dom = tableContainerRef.current;
  const maxWidth = dom ? dom.offsetWidth - DIFF_WIDTH : MAX_WIDTH;

  const dataWidth =
    maxWidth / curSheetStructure.length > MIN_WIDTH
      ? maxWidth / curSheetStructure.length
      : MIN_WIDTH;
  const tableColumns: ColumnProps[] = curSheetStructure.map(column => ({
    id: column.column_name,
    dataIndex: column.column_name,
    columnType: column.column_type,
    title: (
      <div className={styles['table-view-title']}>
        <Typography.Text
          className={styles['table-view-title-content']}
          ellipsis={{
            showTooltip: {
              opts: { content: column.column_name },
            },
          }}
        >
          {column.column_name}
        </Typography.Text>
        {column.is_semantic ? (
          <Tag color="green" className={styles['semantic-tag']}>
            {I18n.t('knowledge_1226_001')}
          </Tag>
        ) : null}
        {column.column_type ? (
          <ColumnTypeComp columnType={column.column_type}></ColumnTypeComp>
        ) : null}
      </div>
    ),
    width: dataWidth,
    render: (text: string, record: TableViewRecord, index: number) => {
      if (column.column_type === ColumnType.Image) {
        const srcList = getSrcFromImg(
          record?.[column?.column_name as string] as string,
        );
        return (
          <ImageRender
            srcList={srcList}
            onChange={(src, tosKey) => {
              let val = '';
              if (src || tosKey) {
                val = `<img src="${src ?? ''}" ${
                  tosKey ? `data-tos-key="${tosKey}"` : ''
                }>`;
              }
              const newRecord = {
                ...record,
                [column?.column_name as string]: val,
              };
              handleCellUpdate(newRecord, index);
            }}
          />
        );
      }
      return (
        <TextRender
          dataIndex={column.column_name}
          value={text}
          record={record}
          index={index}
          editable
          validator={{
            validate: value => {
              if (column.is_semantic) {
                return !value || value === '';
              }
              return false;
            },
            errorMsg: I18n.t('datasets_url_empty'),
          }}
          onBlur={async (_text, updateRecord) =>
            await handleCellUpdate(updateRecord, index)
          }
        />
      );
    },
  }));

  // Add action column
  tableColumns.push({
    title: <></>,
    width: 100,
    dataIndex: 'actions',
    className: styles['unit-actions-column'],
    fixed: 'right',
    render: (_text, record, index) => (
      <ActionsRender
        record={record}
        index={index}
        editProps={{
          disabled: false,
          onEdit: () => {
            handleEdit?.(record, index);
          },
        }}
        deleteProps={{
          disabled: false,
          onDelete: () => {
            handleDel?.([index]);
          },
        }}
      />
    ),
  });

  const tableDataItem = transformTableData<DocTableColumn>(
    curSheetStructure,
    'column_name',
  );

  return {
    sheetStructure: curSheetStructure,
    tableColumns,
    tableData: tableDataItem,
  };
}

export function getSubmitBtnStatus(
  sheetStructure: DocTableColumn[],
  tableData: TableViewRecord[],
  loading?: boolean,
) {
  if (loading) {
    return FooterBtnStatus.LOADING;
  }
  const semanticItem = sheetStructure.find(item => item.is_semantic);
  if (!semanticItem) {
    return FooterBtnStatus.DISABLE;
  }

  const semanticItemName = semanticItem?.column_name;
  if (!semanticItemName) {
    return FooterBtnStatus.DISABLE;
  }

  if (!tableData.length) {
    return FooterBtnStatus.DISABLE;
  }

  const hasSemanticItemNull = tableData.some(
    item => item && item[semanticItemName] === '',
  );

  if (hasSemanticItemNull) {
    return FooterBtnStatus.DISABLE;
  }

  return FooterBtnStatus.ENABLE;
}
