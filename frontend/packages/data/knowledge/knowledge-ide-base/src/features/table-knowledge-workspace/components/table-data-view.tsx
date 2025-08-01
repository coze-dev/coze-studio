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

import classnames from 'classnames';
import {
  useKnowledgeParamsStore,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { KnowledgeE2e } from '@coze-data/e2e';
import { TableView } from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { DocumentStatus } from '@coze-arch/bot-api/knowledge';

import styles from '../styles/index.module.less';
import { getTableRenderColumnsData } from '../service/use-case/get-table-render-columns-data';
import { useTableSliceOperations } from '../hooks/use-case/use-table-slice-operations';
import { useTableSegmentModal } from '../hooks/use-case/use-table-segment-modal';
import { useDeleteSliceModal } from '../hooks/use-case/use-delete-slice-modal';
import { useAddRow } from '../hooks/use-case/use-add-row';
import { useTableHeight } from '../hooks/inner/use-table-height';
import { useScroll } from '../hooks/inner/use-scroll';
import { useTableUI } from '../context/table-ui-context';
import { useTableData } from '../context/table-data-context';
import { useTableActions } from '../context/table-actions-context';

// Table Content Component
const TableContent = () => {
  const knowledgeIDEBiz = useKnowledgeParamsStore(state => state.params.biz);
  const documentList = useKnowledgeStore(state => state.documentList);
  const curDoc = documentList?.[0];

  const { tableViewRef, isLoadingMoreSliceList, isLoadingSliceList } =
    useTableUI();

  const { sliceListData } = useTableData();

  const slices = sliceListData?.list;

  const { loadMoreSliceList } = useTableActions();

  const canEdit = Boolean(useKnowledgeStore(state => state.canEdit));

  // Delete slice pop-up
  const { deleteSliceModalNode, openDeleteSliceModal } = useDeleteSliceModal();

  // Edit slice pop-up
  const { tableSegmentModalNode, openTableSegmentModal } =
    useTableSegmentModal();

  // Get table manipulation method
  const { deleteSlice, rowUpdateSliceData, modalEditSlice } =
    useTableSliceOperations({
      openDeleteSliceModal,
      openTableSegmentModal,
    });

  const { tableH } = useTableHeight();

  // If there is no data, return to empty directly
  if (!slices?.length) {
    return null;
  }

  const tableKey = curDoc?.document_id;

  const { data: dataSource, columns } = getTableRenderColumnsData({
    sliceList: slices,
    metaData: curDoc?.table_meta,
    onEdit: modalEditSlice,
    onDelete: deleteSlice,
    onUpdate: rowUpdateSliceData,
    canEdit,
    tableKey: tableKey || '',
  });

  return (
    <div
      className={classnames(
        styles['table-view-container-box'],
        'table-view-box',
      )}
      style={{ height: tableH }}
    >
      <TableView
        tableKey={tableKey}
        ref={tableViewRef}
        className={classnames(
          `${styles['unit-table-view']} ${
            isLoadingMoreSliceList ? styles['table-view-loading'] : ''
          }`,
          knowledgeIDEBiz === 'project'
            ? styles['table-preview-max']
            : styles['table-preview-secondary'],
        )}
        resizable
        dataSource={dataSource}
        loading={isLoadingSliceList}
        columns={columns}
        rowSelect={canEdit}
        isVirtualized
        rowOperation={canEdit}
        scrollToBottom={() => {
          if (!isLoadingSliceList && !isLoadingMoreSliceList) {
            loadMoreSliceList();
          }
        }}
        editProps={{
          onDelete: indexs => deleteSlice(indexs as number[]),
          onEdit: (record, index) => {
            modalEditSlice(record, index as number);
          },
        }}
      />
      {deleteSliceModalNode}
      {tableSegmentModalNode}
    </div>
  );
};

// Add line button component
const AddRowButton = () => {
  const { isShowAddBtn } = useTableUI();
  const documentList = useKnowledgeStore(state => state.documentList);
  const curDoc = documentList?.[0];
  const { increaseTableHeight } = useTableHeight();
  const { scrollTableBodyToBottom } = useScroll();
  const { handleAddRow } = useAddRow({
    increaseTableHeight,
    scrollTableBodyToBottom,
  });

  if (!isShowAddBtn) {
    return null;
  }

  return (
    <div className={styles['add-row-btn']}>
      <Button
        disabled={curDoc?.status === DocumentStatus.Processing}
        data-testid={KnowledgeE2e.SegmentDetailContentAddRowBtn}
        color="primary"
        size="default"
        icon={<IconCozPlus />}
        onClick={handleAddRow}
      >
        {I18n.t('knowledge_optimize_0010')}
      </Button>
    </div>
  );
};

// main component
export const TableDataView = () => {
  const { sliceListData } = useTableData();
  const slices = sliceListData?.list;

  // If there is no data, only the add button is displayed.
  if (!slices?.length) {
    return <AddRowButton />;
  }

  return (
    <>
      <TableContent />
      <AddRowButton />
    </>
  );
};
