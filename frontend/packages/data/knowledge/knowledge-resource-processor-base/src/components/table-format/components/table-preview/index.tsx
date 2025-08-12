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

import React, { useMemo } from 'react';

import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { getDataTypeText } from '@coze-data/utils';
import { KnowledgeE2e } from '@coze-data/e2e';
import { ImageRender, type TableViewColumns } from '@coze-common/table-view';
import { ColumnType } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { Table, Tag, Typography } from '@coze-arch/coze-design';

import { getSrcFromImg } from '@/utils/table';
import { type TableInfo, type TableSettings } from '@/types';
import { TableSettingFormFields } from '@/constants';

import styles from './index.module.less';

export interface TablePreviewProps {
  data: TableInfo;
  settings: TableSettings;
}

interface PreviewColumn {
  [key: string]: string;
}

const ColumnTypeComp = (props: { columnType: ColumnType }) => (
  <Tag color="primary" className={styles['column-type']} size="mini">
    {getDataTypeText(props.columnType)}
  </Tag>
);

const baseClassName = 'table-preview';
const maxDataLen = 10;
export const TablePreview: React.FC<TablePreviewProps> = ({
  data,
  settings,
}) => {
  const { sheet_list = [], table_meta = {}, preview_data = {} } = data;
  const startRow = Number(settings[TableSettingFormFields.DATA_START_ROW]) || 0;
  // Selected table id
  const sheetId = useMemo(
    () => settings[TableSettingFormFields.SHEET] || 0,
    [settings],
  );
  // Selected table name
  const sheetName = useMemo(
    () => (sheet_list || []).find(sheet => sheet?.id === sheetId)?.sheet_name,
    [sheet_list, sheetId],
  );
  // The amount of data for the selected table
  const total = useMemo(
    () =>
      Number(
        (sheet_list || []).find(sheet => sheet?.id === sheetId)?.total_row || 0,
      ) - startRow || 0,
    [sheet_list, sheetId],
  );
  const newColumns: ColumnProps<PreviewColumn | TableViewColumns>[] = (
    table_meta[sheetId] || []
  ).map(meta => {
    const {
      sequence,
      column_name,
      is_semantic,
      column_type = ColumnType.Unknown,
    } = meta;
    if (column_type === ColumnType.Image) {
      return {
        title: (
          <div className={styles['td-title']}>
            <div>{column_name}</div>
            <ColumnTypeComp columnType={column_type}></ColumnTypeComp>
          </div>
        ),
        dataIndex: sequence,
        render: (text, _record) => {
          const srcList = getSrcFromImg(text);
          return <ImageRender srcList={srcList} editable={false} />;
        },
      };
    }
    return {
      title: is_semantic ? (
        <div className={styles['td-title']}>
          {column_name}
          {is_semantic ? (
            <Tag
              size="mini"
              color="green"
              className={styles['semantic-tag']}
              data-testid={KnowledgeE2e.TableLocalPreviewSemantic}
            >
              {I18n.t('knowledge_1226_001')}
            </Tag>
          ) : null}
          <ColumnTypeComp columnType={column_type}></ColumnTypeComp>
        </div>
      ) : (
        <div className={styles['td-title']}>
          {column_name}
          <ColumnTypeComp columnType={column_type}></ColumnTypeComp>
        </div>
      ),
      width: 180,
      dataIndex: sequence,
      ellipsis: { showTitle: false },
      render: text => (
        <Typography.Text ellipsis={{ showTooltip: true }}>
          {text}
        </Typography.Text>
      ),
    };
  });
  const dataList = useMemo(() => {
    const previewData = preview_data[sheetId] || [];
    return previewData
      .slice(0, maxDataLen)
      .sort((a, b) =>
        (JSON.stringify(a) as unknown as number) >
        (JSON.stringify(b) as unknown as number)
          ? 1
          : -1,
      );
  }, [preview_data, sheetId]);
  return (
    <div className={styles[baseClassName]}>
      {dataList.length ? (
        <>
          <div
            className={styles[`${baseClassName}-title`]}
            data-testid={KnowledgeE2e.TableLocalPreviewTitle}
          >
            {sheetName}
          </div>
          <div className={styles[`${baseClassName}-content`]}>
            <Table
              tableProps={{
                dataSource: dataList,
                columns: newColumns,
              }}
            />
          </div>
          <div
            className={styles['preview-tips']}
            data-testid={KnowledgeE2e.TableLocalPreviewFooterTotal}
          >
            {I18n.t('datasets_unit_tableformat_tips1', {
              TotalRows: total,
              ShowRows: Number(total) > maxDataLen ? maxDataLen : total,
            })}
          </div>
        </>
      ) : (
        <div className={styles['no-result']}>
          <IllustrationNoResult></IllustrationNoResult>
          <div className={styles['no-result-tips']}>
            {I18n.t('knowledge_1221_02')}
          </div>
        </div>
      )}
    </div>
  );
};
