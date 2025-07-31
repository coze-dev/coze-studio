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

import { useShallow } from 'zustand/react/shallow';
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

import { isLocalTextDocument } from '@/utils/is-local-text-document';
import { convertFilterStrategyToParams } from '@/utils/convert-filter-strategy-to-params';
import { useDocIdFromQuery, reportProcessDocumentFail } from '@/utils';
import { usePollingTaskProgress } from '@/hooks';
import { getCustomValues } from '@/features/knowledge-type/text/utils';

import { type UploadTextResegmentStore } from '../../store';

export const useResegment = <T extends UploadTextResegmentStore>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const params = useKnowledgeParams();
  const { segmentMode, segmentRule, setCreateStatus, setProgressList } =
    useStore(
      useShallow(state => ({
        segmentMode: state.segmentMode,
        segmentRule: state.segmentRule,
        setCreateStatus: state.setCreateStatus,
        setProgressList: state.setProgressList,
      })),
    );
  const pollingTaskProgress = usePollingTaskProgress();
  const docId = useDocIdFromQuery() ?? '';

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
      const { parsingStrategy, filterStrategy, documentInfo } =
        useStore.getState();
      const isLocalText = documentInfo && isLocalTextDocument(documentInfo);
      const fixedParsingStrategy = isLocalText ? parsingStrategy : undefined;
      try {
        const { document_infos = [] } = await KnowledgeApi.Resegment(
          merge(
            {},
            {
              dataset_id: params.datasetID,
              document_ids: [docId],
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
          reportProcessDocumentFail(
            document_infos,
            REPORT_EVENTS.KnowledgeProcessDocument,
          );
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
