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

import { useState, useMemo, useRef, useEffect } from 'react';

import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';
import { I18n } from '@coze-arch/i18n';
import { type TableType, type FieldItem } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import {
  Modal,
  Table,
  Divider,
  Typography,
  CozPagination,
  Empty,
} from '@coze-arch/coze-design';

import { RowEditModal } from '../row-edit-modal';
import { resizeFn } from '../../utils/table';
import { useConnectorOptions } from '../../hooks/use-connector-options';
import { type TableRow } from './type';
import { ToolButtonsBar } from './tool-buttons-bar';
import {
  formatTableDataRow,
  formatTableStructList,
  getTableColumns,
} from './formatter';
import { BatchDeleteToolbar } from './batch-delete-toolbar';

import styles from './index.module.less';

interface DatabaseTableDataProps {
  databaseId: string;
  tableType: TableType;
  tableFields: FieldItem[];
  isReadonlyMode: boolean;
  enterFrom?: string;
  onAfterEditRecords?: () => void;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export function DatabaseTableData({
  databaseId,
  tableType,
  tableFields,
  isReadonlyMode,
  enterFrom,
  onAfterEditRecords,
}: DatabaseTableDataProps) {
  const fields = useMemo(
    () => formatTableStructList(tableFields),
    [tableFields],
  );

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataRows, setDataRows] = useState<Record<string, string>[]>([]);

  const { loading, refresh } = useRequest(
    () =>
      MemoryApi.ListDatabaseRecords({
        database_id: databaseId,
        table_type: tableType,
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      }),
    {
      onSuccess: res => {
        setTotalRecords(res.TotalNum);
        setDataRows(res.data);
      },
      refreshDeps: [databaseId, tableType, pageSize, currentPage],
    },
  );

  const tableDataSource = useMemo(
    () => formatTableDataRow(fields, dataRows),
    [fields, dataRows],
  );

  const afterEdit = () => {
    refresh();
    onAfterEditRecords?.();
  };

  const connectorOptions = useConnectorOptions({ includeMigrated: true });
  const connectorNames = useMemo(
    () =>
      Object.fromEntries(
        connectorOptions.map(item => [item.value, item.label]),
      ),
    [connectorOptions],
  );

  const [selectedRows, setSelectedRows] = useState<TableRow[]>([]);

  const handleBatchDelete = () =>
    Modal.confirm({
      title: I18n.t('db_optimize_026'),
      content: I18n.t('db_optimize_027'),
      okText: I18n.t('dialog_240305_03'),
      okButtonColor: 'red',
      cancelText: I18n.t('dialog_240305_04'),
      onOk: async () => {
        await MemoryApi.UpdateDatabaseRecords({
          database_id: databaseId,
          table_type: tableType,
          record_data_delete: selectedRows.map(row => ({
            bstudio_id: row.bstudio_id.value as string,
          })),
        });
        setSelectedRows([]);
        afterEdit();
      },
    });

  const [rowEditModelVisible, setRowEditModelVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<TableRow>();
  const handleEditRow = (row?: TableRow) => {
    setEditingRow(row);
    setRowEditModelVisible(true);
  };

  const handleRowEditSubmit = async (
    values: Record<string, string>,
    originalConnectorId?: string,
  ) => {
    if (!originalConnectorId) {
      await MemoryApi.UpdateDatabaseRecords({
        database_id: databaseId,
        table_type: tableType,
        record_data_add: [values],
      });
    } else {
      await MemoryApi.UpdateDatabaseRecords({
        database_id: databaseId,
        table_type: tableType,
        record_data_alter: [values],
        // When editing the line, bring the original connector_id, and the backend needs to determine whether the data comes from/targets the "bean bag" channel
        ori_connector_id: originalConnectorId,
      });
    }
    setRowEditModelVisible(false);
    setEditingRow(undefined);
    afterEdit();
  };

  const handleDeleteRow = async (row: TableRow) => {
    await MemoryApi.UpdateDatabaseRecords({
      database_id: databaseId,
      table_type: tableType,
      record_data_delete: [
        {
          bstudio_id: row.bstudio_id.value as string,
        },
      ],
    });
    afterEdit();
  };

  const tableFieldColumns = useMemo(
    () =>
      getTableColumns({
        fieldList: fields,
        isReadonlyMode,
        connectorNames,
        handleDeleteRow,
        handleEditRow,
      }),
    [fields, isReadonlyMode, connectorNames],
  );

  const [tableHeight, setTableHeight] = useState(0);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(entires => {
      for (const e of entires) {
        if (e.target === tableWrapperRef.current) {
          setTableHeight(e.contentRect.height);
        }
      }
    });
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.table} ref={tableWrapperRef}>
      <ToolButtonsBar
        readonly={isReadonlyMode}
        databaseId={databaseId}
        tableType={tableType}
        tableFields={fields}
        onNewRow={() => handleEditRow()}
        onRefresh={refresh}
      />
      <Table
        tableProps={{
          loading,
          columns: tableFieldColumns,
          dataSource: tableDataSource,
          rowSelection: {
            fixed: true,
            selectedRowKeys: selectedRows.map(
              r => r.bstudio_id?.value as string,
            ),
            onChange: (_, rows) => setSelectedRows(rows ?? []),
          },
          resizable: {
            onResize: resizeFn,
          },
          rowKey: (record: TableRow) => record?.bstudio_id?.value as string,
          scroll: {
            // 128 = ToolButtonsBar (52) + Header (28) + Pagination (48)
            y: tableHeight > 128 ? tableHeight - 128 : 'auto',
          },
          pagination: {
            total: totalRecords,
            currentPage,
            pageSize,
            onChange: (current, size) => {
              setCurrentPage(current);
              setPageSize(size);
              setSelectedRows([]);
            },
          },
          renderPagination: paginationProps => (
            <div className="w-full flex gap-[8px] items-center justify-end">
              <Typography.Text type="secondary" fontSize="12px">
                {I18n.t('db_optimize_032', { n: totalRecords })}
              </Typography.Text>
              <Divider layout="vertical" className="h-[16px]" />
              <CozPagination
                size="small"
                showSizeChanger
                pageSizeOpts={[20, 50, 100]}
                {...paginationProps}
              />
            </div>
          ),
        }}
        wrapperClassName={classNames(styles['table-wrapper'], {
          // Use coz-bg-max white background for database data tables in Project IDE
          [styles['table-wrapper-project']]: enterFrom === 'project',
        })}
        empty={
          <Empty
            image={<IllustrationNoContent className="w-[140px] h-[140px]" />}
            title={I18n.t('timecapsule_0108_003')}
          />
        }
        indexRowSelection
      />
      <BatchDeleteToolbar
        selectedCount={selectedRows.length}
        onDelete={handleBatchDelete}
        onCancel={() => setSelectedRows([])}
      />
      <RowEditModal
        fields={fields}
        visible={rowEditModelVisible}
        tableType={tableType}
        initialValues={editingRow}
        onSubmit={handleRowEditSubmit}
        onCancel={() => setRowEditModelVisible(false)}
      />
    </div>
  );
}
