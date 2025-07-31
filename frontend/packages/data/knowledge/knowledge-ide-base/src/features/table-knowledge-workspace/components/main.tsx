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

import { useMemo, useRef, useState } from 'react';

import classnames from 'classnames';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type TableViewMethods } from '@coze-common/table-view';
import { I18n } from '@coze-arch/i18n';
import { EmptyState, Spin, Layout } from '@coze-arch/coze-design';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import styles from '../styles/index.module.less';
import { useGetSliceListData } from '../hooks/inner/use-get-slice-list-data';
import { TableUIContext } from '../context/table-ui-context';
import { TableDataContext } from '../context/table-data-context';
import { TableActionsContext } from '../context/table-actions-context';
import { TableDataView } from './table-data-view';

const MAX_TOTAL = 1000;

export interface TableKnowledgeWorkspaceProps {
  onChangeDocList?: (docList: DocumentInfo[]) => void;
  reload?: () => void;
  isReloading: boolean;
}

export const TableKnowledgeWorkspace = ({
  isReloading,
}: TableKnowledgeWorkspaceProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const tableViewRef = useRef<TableViewMethods>(null);
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const documentList = useKnowledgeStore(state => state.documentList)?.filter(
    doc => doc.document_id,
  ) as { document_id: string }[];
  const [curIndex, setCurIndex] = useState(0);
  const [curSliceId, setCurSliceId] = useState('');
  const [delSliceIds, setDelSliceIds] = useState<string[]>([]);

  const {
    sliceListData,
    mutateSliceListData,
    loadMoreSliceList,
    isLoadingSliceList,
    isLoadingMoreSliceList,
  } = useGetSliceListData();

  const slices = sliceListData?.list;

  const isShowAddBtn = useMemo(
    () =>
      Boolean(
        canEdit &&
          !sliceListData?.hasMore &&
          sliceListData?.total &&
          sliceListData?.total < MAX_TOTAL,
      ),
    [canEdit, sliceListData],
  );

  const hasShowEmptyContent = useMemo(() => {
    if (!documentList?.length && !isReloading) {
      return true;
    }
    return (
      sliceListData?.ready &&
      !slices?.length &&
      !(isLoadingMoreSliceList || isLoadingSliceList)
    );
  }, [
    sliceListData,
    documentList,
    isReloading,
    isLoadingMoreSliceList,
    isLoadingSliceList,
    slices,
  ]);

  // Creating UI Context Values
  const uiContextValue = {
    tableViewRef,
    isLoadingMoreSliceList,
    isLoadingSliceList,
    isShowAddBtn,
  };

  // Creating Data Context Values
  const dataContextValue = {
    sliceListData: sliceListData || { list: [], total: 0 },
    curIndex,
    curSliceId,
    delSliceIds,
  };

  // Create Action Context Value
  const actionsContextValue = {
    setCurIndex,
    setCurSliceId,
    setDelSliceIds,
    loadMoreSliceList,
    mutateSliceListData,
  };

  return (
    <TableUIContext.Provider value={uiContextValue}>
      <TableDataContext.Provider value={dataContextValue}>
        <TableActionsContext.Provider value={actionsContextValue}>
          <Layout.Content
            ref={containerRef}
            className={classnames(
              styles['slice-list-ui-content'],
              'knowledge-ide-base-slice-list-ui-content',
            )}
          >
            <Spin
              spinning={isLoadingSliceList}
              wrapperClassName={styles.spin}
              size="large"
              style={{ width: '100%', height: '100%' }}
            >
              {slices?.length ? (
                <div
                  ref={contentWrapperRef}
                  className={styles['slice-list-table']}
                >
                  <TableDataView />
                </div>
              ) : null}
              {hasShowEmptyContent && !isLoadingSliceList ? (
                <div className={styles['empty-content']}>
                  <EmptyState
                    size="large"
                    icon={
                      <IconSegmentEmpty
                        style={{ width: 150, height: '100%' }}
                      />
                    }
                    title={I18n.t('dataset_segment_empty_desc')}
                  />
                </div>
              ) : null}
            </Spin>
          </Layout.Content>
        </TableActionsContext.Provider>
      </TableDataContext.Provider>
    </TableUIContext.Provider>
  );
};
