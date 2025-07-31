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

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { useScrollListSliceReq } from '@/service';

export const useGetSliceListData = () => {
  const documentList = useKnowledgeStore(state => state.documentList);
  const curDocId = documentList?.[0]?.document_id;
  // load data
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
