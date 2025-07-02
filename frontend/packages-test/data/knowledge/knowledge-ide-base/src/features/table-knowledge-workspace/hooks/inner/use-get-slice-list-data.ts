import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { useScrollListSliceReq } from '@/service';

export const useGetSliceListData = () => {
  const documentList = useKnowledgeStore(state => state.documentList);
  const curDocId = documentList?.[0]?.document_id;
  // 加载数据
  const {
    data: sliceListData,
    mutate: mutateSliceListData,
    reload: reloadSliceList,
    loadMore: loadMoreSliceList,
    loading: isLoadingSliceList,
    loadingMore: isLoadingMoreSliceList,
  } = useScrollListSliceReq({
    params: {
      document_id: curDocId,
    },
    reloadDeps: [curDocId],
    target: null,
    onError: error => {
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: ReportEventNames.KnowledgeGetSliceList,
        error,
      });

      Toast.error(I18n.t('knowledge_document_view'));
    },
  });

  return {
    sliceListData,
    mutateSliceListData,
    reloadSliceList,
    loadMoreSliceList,
    isLoadingMoreSliceList,
    isLoadingSliceList,
  };
};
