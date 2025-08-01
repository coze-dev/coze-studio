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

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import classNames from 'classnames';
import { IllustrationConstruction } from '@douyinfe/semi-illustrations';
import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  TableView,
  type TableViewRecord,
  colWidthCacheService,
} from '@coze-common/table-view';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { UIEmpty } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import {
  type SearchBotTableInfoResponse,
  TableType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { MAX_WIDTH, getColumns } from './get-columns';

import s from './index.module.less';

export interface DatabaseTable {
  database: DatabaseInfo;
  botID?: string;
  workflowID?: string;
  projectID?: string;
}

export interface DataTableRef {
  refetch?: () => Promise<void>;
}

export const DataTable = forwardRef<DataTableRef, DatabaseTable>(
  (props, ref) => {
    const { database, botID, workflowID, projectID } = props;
    const { tableId } = database;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Record<string, unknown>[]>([]);

    colWidthCacheService.initWidthMap();
    const columns: { list: ColumnProps[]; width: number } = useMemo(
      () => getColumns(database.tableMemoryList, tableId),
      [database.tableMemoryList],
    );

    const fetchTableData = async () => {
      setLoading(true);

      let resp: SearchBotTableInfoResponse | undefined;
      try {
        resp = await MemoryApi.ListDatabaseRecords({
          project_id: projectID,
          workflow_id: workflowID,
          bot_id: botID,
          database_id: tableId,
          offset: 0,
          limit: 0,
          table_type: TableType.DraftTable,
        });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseQueryTable,
          error:
            error instanceof Error
              ? error
              : new CustomError(
                  REPORT_EVENTS.DatabaseQueryTable,
                  `${REPORT_EVENTS.DatabaseQueryTable}: operation fail`,
                ),
        });
      }

      if (resp?.data) {
        setData(resp?.data || []);
      }

      setLoading(false);
    };

    useEffect(() => {
      fetchTableData();
    }, []);

    useImperativeHandle(ref, () => ({
      refetch: fetchTableData,
    }));

    const handleResize = col => {
      const resizeList = columns.list.filter(
        item => item.dataIndex !== col.dataIndex,
      );
      // Calculate the minimum width that the drag column can drag, and return the minimum width if it is less than the minimum width
      const widthCount = resizeList.reduce(
        (prev, cur) => Number(prev) + Number(cur.width),
        0,
      );
      const minWidth = MAX_WIDTH - widthCount;
      if (widthCount + col.width < MAX_WIDTH) {
        return {
          ...col,
          width: col.width < minWidth ? minWidth : col.width,
        };
      }
      return col;
    };

    if (!data?.length && !loading) {
      return (
        <UIEmpty
          className={classNames([s['empty-wrapper-database'], 'pb-0'])}
          empty={{
            icon: <IllustrationConstruction />,
            title: I18n.t('timecapsule_0108_003'),
          }}
        ></UIEmpty>
      );
    }

    return (
      <TableView
        tableKey={tableId}
        columns={columns.list}
        dataSource={data as TableViewRecord[]}
        loading={loading}
        className={s['data-table']}
        resizable
        onResize={handleResize}
      />
    );
  },
);
