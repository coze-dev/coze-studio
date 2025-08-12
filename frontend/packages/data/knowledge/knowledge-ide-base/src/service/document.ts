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

import { useEffect, useRef } from 'react';

import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { reportFailGetProgress } from '@coze-data/knowledge-resource-processor-base/utils';
import {
  clearPolling,
  isStopPolling,
} from '@coze-data/knowledge-resource-processor-base';
import { KNOWLEDGE_MAX_DOC_SIZE } from '@coze-data/knowledge-modal-base';
import {
  REPORT_EVENTS,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import {
  type PhotoDetailResponse,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { type ProgressMap } from '@/types';
import { POLLING_TIME } from '@/constant';

export const useListDocumentReq = (
  onSuccess?: (res: DocumentInfo[] | undefined) => void,
  onError?: () => void,
) => {
  const capture = useErrorHandler();
  const { data, run, loading, mutate } = useRequest(
    async ({
      datasetID,
      page,
      size,
    }: {
      datasetID: string;
      page?: number;
      size?: number;
    }) => {
      if (!datasetID) {
        throw new CustomError(
          'useListDocumentReq_error',
          'datasetid cannot be empty',
        );
      }
      try {
        const res = await KnowledgeApi.ListDocument({
          dataset_id: datasetID,
          page: page ?? 0,
          size: size ?? KNOWLEDGE_MAX_DOC_SIZE,
        });
        if (res.document_infos) {
          onSuccess?.(res.document_infos);
          return res.document_infos;
        }

        capture(new CustomError('useListDataSetReq_error', res.msg || ''));
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: ReportEventNames.KnowledgeGetDataSetDeatil,
          error: error as Error,
        });
      }
    },
    {
      // No automatic request
      manual: true,
      onError: error => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
        capture(error);
      },
    },
  );
  return { data, run, loading, mutate };
};

export const usePollingTaskProgress = () => {
  const pollingId = useRef<number>();
  useEffect(
    () => () => {
      clearPolling(pollingId);
    },
    [],
  );
  const pollingTaskProgressInternal = (
    documentIds: string[],
    options: {
      onProgressing: (progressMap: ProgressMap) => void;
      onFinish: () => void;
      isImage?: boolean;
      dataSetId?: string;
    },
  ) => {
    // An ongoing poll needs to be aborted before starting a new poll
    if (pollingId.current) {
      clearPolling(pollingId);
    }

    const fetchProgress = async () => {
      const { data = [] } = await KnowledgeApi.GetDocumentProgress({
        document_ids: documentIds,
      });

      let photoInfos: PhotoDetailResponse['photo_infos'];

      // Check photo details separately
      if (options.isImage) {
        photoInfos = (
          await KnowledgeApi.PhotoDetail({
            document_ids: documentIds,
            // @ts-expect-error -- linter-disable-autofix
            dataset_id: options.dataSetId,
          })
        )?.photo_infos;
      }
      const updatedProgressMap = data.reduce((res, item) => {
        // Add photo details separately
        // @ts-expect-error -- linter-disable-autofix
        const detail = photoInfos?.[item.document_id] || {};
        // @ts-expect-error -- linter-disable-autofix
        res[item.document_id] = {
          status: item.status,
          progress: item.progress,
          ...detail,
        };
        return res as ProgressMap;
      }, {}) as ProgressMap;

      reportFailGetProgress(data);
      options.onProgressing(updatedProgressMap);

      if (isStopPolling(data)) {
        options.onFinish();
        clearPolling(pollingId);
      }
    };

    // Execute once immediately
    const immediatelyExecuteFunction = () => {
      fetchProgress();
      return fetchProgress;
    };

    pollingId.current = window.setInterval(
      immediatelyExecuteFunction(),
      POLLING_TIME,
    );
  };
  return pollingTaskProgressInternal;
};
export const useUpdateDocument = ({ onSuccess }) => {
  const { run, loading } = useRequest(
    async params => {
      if (!params.document_id) {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeUpdateDocumentName,
          `${REPORT_EVENTS.KnowledgeUpdateDocumentName}: missing doc_id`,
        );
      }
      await KnowledgeApi.UpdateDocument(params);
    },
    {
      manual: true,
      onSuccess: () => {
        onSuccess();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateDocumentName,
          error,
        });
      },
    },
  );
  return { run, loading };
};
