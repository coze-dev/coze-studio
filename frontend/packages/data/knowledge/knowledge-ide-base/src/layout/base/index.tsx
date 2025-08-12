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

import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { DataErrorBoundary, DataNamespace } from '@coze-data/reporter';
import {
  useDataCallbacks,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { useReportTti } from '@coze-arch/report-tti';
import { I18n } from '@coze-arch/i18n';
import { Layout } from '@coze-arch/coze-design';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { type DocumentInfo, type Dataset } from '@coze-arch/bot-api/knowledge';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';
import { usePollingTaskProgress } from '@/service';
import { useReloadKnowledgeIDE } from '@/hooks/use-case/use-reload-knowledge-ide';

import {
  type KnowledgeIDEBaseLayoutProps,
  type KnowledgeRenderContext,
} from '../module';

export const KnowledgeIDEBaseLayout = ({
  keepDocTitle,
  className,
  renderNavBar,
  renderContent,
}: KnowledgeIDEBaseLayoutProps) => {
  const { onUpdateDisplayName, onStatusChange } = useDataCallbacks();

  const { setDataSetDetail, dataSetDetail, setDocumentList, documentList } =
    useKnowledgeStore(
      useShallow(state => ({
        setDataSetDetail: state.setDataSetDetail,
        dataSetDetail: state.dataSetDetail,
        setDocumentList: state.setDocumentList,
        documentList: state.documentList,
      })),
    );
  const [progressMap, setProgressMap] = useState<ProgressMap>({});

  const pollingTaskProgressInternal = usePollingTaskProgress();
  const { reload, loading: isReloading, reset } = useReloadKnowledgeIDE();
  // initialization
  useEffect(() => {
    reload();
    return () => {
      reset();
    };
  }, []);
  // Callback to project IDE tab
  useEffect(() => {
    if (dataSetDetail?.name) {
      onUpdateDisplayName?.(dataSetDetail.name);
      onStatusChange?.('normal');
    }
  }, [dataSetDetail?.name]);
  useReportTti({
    isLive: !!documentList?.length,
  });
  useEffect(() => {
    const progressIds = dataSetDetail?.processing_file_id_list;
    if (progressIds && progressIds.length) {
      pollingTaskProgressInternal(progressIds, {
        onProgressing: res => {
          setProgressMap(res);
        },
        onFinish: () => {
          reload();
        },
        dataSetId: dataSetDetail?.dataset_id,
        isImage: dataSetDetail?.format_type === FormatType.Image,
      });
    }
  }, [dataSetDetail]);

  // Build the rendering context
  const renderContext: KnowledgeRenderContext = {
    layoutProps: {
      keepDocTitle,
      renderContent,
      renderNavBar,
    },
    dataInfo: {
      dataSetDetail,
      documentList,
    },
    statusInfo: {
      isReloading,
      progressMap,
    },
    dataActions: {
      refreshData: reload,
      updateDataSetDetail: (data: Dataset) => setDataSetDetail(data || {}),
      updateDocumentList: (data: DocumentInfo[]) => setDocumentList(data || []),
    },
  };

  // Editor Profile
  return (
    <DataErrorBoundary namespace={DataNamespace.KNOWLEDGE}>
      <Layout
        className={
          className ||
          'flex flex-col p-[24px] pt-[16px] gap-[16px] !bg-transparent '
        }
        title={renderHtmlTitle(
          `${dataSetDetail?.name} - ${I18n.t('tab_dataset_list')}`,
        )}
        keepDocTitle={keepDocTitle}
      >
        {/* navigation bar */}
        {renderNavBar?.(renderContext)}
        {/* content area */}
        {renderContent?.(renderContext)}
      </Layout>
    </DataErrorBoundary>
  );
};
