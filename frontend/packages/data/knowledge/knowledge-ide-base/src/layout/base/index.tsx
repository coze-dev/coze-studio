import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { DataErrorBoundary, DataNamespace } from '@coze-data/reporter';
import {
  useDataCallbacks,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { useReportTti } from '@coze-arch/report-tti';
import { I18n } from '@coze-arch/i18n';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { type DocumentInfo, type Dataset } from '@coze-arch/bot-api/knowledge';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import { Layout } from '@coze/coze-design';

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
  const { reload, loading, reset } = useReloadKnowledgeIDE();
  // 初始化
  useEffect(() => {
    reload();
    return () => {
      reset();
    };
  }, []);
  // 回调 project IDE tab
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

  // 构建渲染上下文
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
      isDocumentLoading: loading,
      progressMap,
    },
    dataActions: {
      refreshData: reload,
      updateDataSetDetail: (data: Dataset) => setDataSetDetail(data || {}),
      updateDocumentList: (data: DocumentInfo[]) => setDocumentList(data || []),
    },
  };

  // 编辑简介
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
        {/* 导航栏 */}
        {renderNavBar?.(renderContext)}
        {/* 内容区 */}
        {renderContent?.(renderContext)}
      </Layout>
    </DataErrorBoundary>
  );
};
