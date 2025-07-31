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

/* eslint-disable @coze-arch/max-line-per-function */

import React, { useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import {
  type TableDataItem,
  useTableSegmentModal,
  ModalActionType,
  transSliceContentOutput,
} from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import {
  TableView,
  type TableViewColumns,
  type TableViewRecord,
} from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze-arch/bot-semi';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { ColumnType } from '@coze-arch/bot-api/memory';
import {
  DocumentSource,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { getAddSegmentParams } from '@/features/knowledge-type/table/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import {
  useFetchAddSegmentReq,
  useFetchListDocumentReq,
  useFetchTableInfoReq,
} from '@/features/knowledge-type/table/hooks';
import { TableStatus } from '@/constants';

import {
  getSubmitBtnStatus,
  tableDataCleaning,
  transformTableData,
} from './utils';
import useTableOperations from './hooks';

import styles from './index.module.less';

interface StructureBarProps {
  docTitle: string;
}

const StructureBar = ({ docTitle }: StructureBarProps) => (
  <div
    className={styles['structure-bar']}
    data-testid={KnowledgeE2e.IncrementTableUploadStructureTitle}
  >
    <div className={styles['structure-bar-title']}>{docTitle}</div>
  </div>
);

interface TableContainerProps {
  loading: boolean;
  tableData: TableViewRecord[];
  columns: TableViewColumns[];
  handleAdd: () => void;
  handleDel: (indexList: (string | number)[]) => void;
  handleEdit: (record: TableViewRecord, index: string | number) => void;
}
const TableContainer = ({
  loading,
  tableData,
  columns,
  handleAdd,
  handleDel,
  handleEdit,
}: TableContainerProps) => (
  <>
    <div className={`${styles['unit-table-container']} `}>
      <Spin
        spinning={loading}
        wrapperClassName={styles.spin}
        size="large"
        style={{ width: '100%', height: '100%' }}
      >
        {tableData.length ? (
          <TableView
            className={`${styles['unit-table-view']} `}
            dataSource={tableData}
            columns={columns}
            rowOperation
            editProps={{
              onDelete: handleDel,
              onEdit: handleEdit,
            }}
          />
        ) : (
          <div className={styles['unit-table-empty']}></div>
        )}
      </Spin>
    </div>
    <div className={`${styles['footer-toolbar']} `}>
      <Button
        data-testid={KnowledgeE2e.IncrementTableUploadStructureAddBtn}
        className={styles['structure-bar-button']}
        type="tertiary"
        onClick={() => {
          handleAdd();
        }}
        icon={<IconCozPlus />}
      >
        {I18n.t('knowledge_custom_add_content')}
      </Button>
    </div>
  </>
);
export const TableUpload = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>({
  useStore,
  footer,
}: ContentProps<T>) => {
  const params = useKnowledgeParams();
  const { docID, spaceID, datasetID } = params;
  const setStatus = useStore(state => state.setStatus);
  const tableStatus = useStore(state => state.status);

  const [columns, setColumns] = useState<TableViewColumns[]>([]);
  const [docInfo, setDocInfo] = useState<DocumentInfo>({});
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const tableMetaRef = useRef<DocTableColumn[]>([]);

  const docTitle = useMemo(() => docInfo?.name || '', [docInfo]);
  const { node: TableSegmentModalNode, edit: editTableSegment } =
    useTableSegmentModal({
      title: I18n.t('knowledg_table_segments_content'),
      meta: tableMetaRef.current || [],
      onFinish: (actionType, data) => {
        const curTableItem = transformTableData<TableDataItem>(
          data,
          'column_name',
          'value',
        );
        const hasEdit = actionType === ModalActionType.Edit;
        if (hasEdit) {
          handleCellUpdate(curTableItem[0], editItemIndex);
        } else {
          const newTableData = [...tableData, ...curTableItem];
          setTableData(newTableData);
        }
      },
    });
  const {
    editItemIndex,
    tableData,
    setTableData,
    sheetStructureRef,
    handleCellUpdate,
    handleDel,
    handleEdit,
    handleAdd,
  } = useTableOperations({
    editTableSegment,
  });

  const fetchTableInfo = useFetchTableInfoReq(
    res => {
      const {
        tableColumns,
        tableData: sTableData,
        sheetStructure: tableSchema,
      } = tableDataCleaning({
        data: res,
        tableContainerRef,
        handleCellUpdate,
        handleEdit,
        handleDel,
      });
      if (tableColumns.length > 0) {
        setColumns(tableColumns);
      }
      if (sTableData.length > 0) {
        setTableData(sTableData);
      }

      if (tableSchema.length > 0) {
        tableMetaRef.current = tableSchema;
        sheetStructureRef.current = tableSchema;
      }
      setStatus(TableStatus.NORMAL);
    },
    () => {
      setStatus(TableStatus.NORMAL);
    },
  );

  const resourceNavigate = useDataNavigate();
  const { fetchAddSegment, addSegmentLoading } = useFetchAddSegmentReq(res => {
    resourceNavigate.toResource?.('knowledge', datasetID);
  });

  const fetchDocumentInfo = useFetchListDocumentReq(setDocInfo);
  useEffect(() => {
    if (docID) {
      setStatus(TableStatus.LOADING);
      fetchDocumentInfo();
      fetchTableInfo({
        document_id: docID,
      });
    }
  }, [docID]);

  function handleSaveTableData() {
    if (!spaceID || !datasetID || !docID) {
      return;
    }
    const imageKeys: string[] = [];
    columns.forEach(col => {
      if (col.columnType === ColumnType.Image) {
        imageKeys.push(col.id as string);
      }
    });
    const formatData = tableData.map(data =>
      Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (imageKeys.includes(key)) {
            return [key, transSliceContentOutput(value as string)];
          }
          return [key, value];
        }),
      ),
    );
    const documentInfo = [
      {
        source_info: {
          document_source: DocumentSource.Custom,
          custom_content: JSON.stringify(formatData),
        },
        table_sheet: {
          sheet_id: '0',
          header_line_idx: '0',
          start_line_idx: '0',
        },
      },
    ];

    const payload = getAddSegmentParams({
      spaceId: spaceID,
      docId: docID,
      datasetId: datasetID,
      documentInfo,
    });
    fetchAddSegment(payload);
  }

  return (
    <div
      ref={tableContainerRef}
      className={classNames(
        'custom-table-container',
        styles['custom-table-container'],
      )}
    >
      <StructureBar docTitle={docTitle} />
      <TableContainer
        loading={tableStatus === TableStatus.LOADING}
        columns={columns}
        tableData={tableData}
        handleAdd={handleAdd}
        handleDel={handleDel}
        handleEdit={handleEdit}
      />
      {TableSegmentModalNode}

      {footer
        ? footer({
            prefix: (
              <span className={styles['footer-sub-tip']}>
                {I18n.t('knowledge_table_custom_submit_tips')}
              </span>
            ),
            btns: [
              {
                e2e: KnowledgeE2e.CreateUnitConfirmBtn,
                type: 'hgltplus',
                theme: 'solid',
                text: I18n.t('variable_reset_yes'),
                onClick: () => {
                  handleSaveTableData();
                },
                status: getSubmitBtnStatus(
                  sheetStructureRef.current,
                  tableData,
                  addSegmentLoading,
                ),
              },
            ],
          })
        : null}
    </div>
  );
};
