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

import { type UseBoundStore, type StoreApi } from 'zustand';
import { merge } from 'lodash-es';
import { useRequest } from 'ahooks';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  type ProgressItem,
  CreateUnitStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { convertFilterStrategyToParams } from '@/utils/convert-filter-strategy-to-params';
import { usePollingTaskProgress } from '@/hooks';
import { getCustomValues } from '@/features/knowledge-type/text/utils';

import { type UploadTextLocalResegmentStore } from '../../store';

export const useResegment = <T extends UploadTextLocalResegmentStore>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const params = useKnowledgeParams();
  const [segmentMode, segmentRule] = useStore(state => [
    state.segmentMode,
    state.segmentRule,
  ]);
  const [setCreateStatus, setProgressList] = useStore(state => [
    state.setCreateStatus,
    state.setProgressList,
  ]);
  const docReviewList = useStore(state => state.docReviewList);
  const pollingTaskProgress = usePollingTaskProgress();
  const docId = params.docID ?? '';

  // TODO: Hierarchical correlation
  const { run: handleProcessText } = useRequest(
    async () => {
      if (!params.datasetID) {
        Toast.warning({
          content: I18n.t('datasets_ID_miss'),
          showClose: false,
        });
        throw new CustomError(
          REPORT_EVENTS.KnowledgeResegment,
          `${REPORT_EVENTS.KnowledgeResegment}: missing datasets_id`,
        );
      }
      const { parsingStrategy, filterStrategy } = useStore.getState();
      const fixedParsingStrategy = parsingStrategy;
      try {
        const { document_infos = [] } = await KnowledgeApi.Resegment(
          merge(
            {},
            {
              dataset_id: params.datasetID,
              document_ids: [docId],
              review_ids: docReviewList.map(item => item.review_id),
              chunk_strategy: getCustomValues(segmentMode, segmentRule),
              parsing_strategy: fixedParsingStrategy,
            },
            convertFilterStrategyToParams(filterStrategy.at(0)),
          ),
        );
        if (Object.keys(document_infos).length) {
          setCreateStatus(CreateUnitStatus.GET_TASK_PROGRESS);
          await pollingTaskProgress(document_infos, {
            onProgressing: (progressList: ProgressItem[]) => {
              setProgressList(progressList);
            },
            onFinish: () => {
              setCreateStatus(CreateUnitStatus.TASK_FINISH);
            },
          });
        }
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeProcessDocument,
          error: error as Error,
        });
      }
    },
    { manual: true },
  );
  return handleProcessText;
};
