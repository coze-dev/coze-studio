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

import { useRef, useEffect } from 'react';

import { type StoreApi, type UseBoundStore } from 'zustand';
import { isString } from 'lodash-es';
import { useRequest } from 'ahooks';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  CheckedStatus,
  CreateUnitStatus,
  type UploadBaseAction,
  type UploadBaseState,
  type ProgressItem,
} from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import {
  type DocumentFileInfo,
  DocumentStatus,
} from '@coze-arch/bot-api/memory';
import {
  type CreateDocumentRequest,
  type CreateDocumentResponse,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { reportFailGetProgress, isStopPolling, clearPolling } from '../utils';
import { useListDocumentReq } from '../services';
import { POLLING_TIME } from '../constants';

export const usePollingTaskProgress = () => {
  const pollingId = useRef<number>();
  useEffect(
    () => () => {
      clearPolling(pollingId);
    },
    [],
  );
  const pollingTaskProgressInternal = async (
    documentList: DocumentFileInfo[],
    options: {
      onProgressing: (progressList: ProgressItem[]) => void;
      onFinish: () => void;
    },
  ) => {
    const { data = [] } = await KnowledgeApi.GetDocumentProgress({
      document_ids: documentList.map(item => item.document_id).filter(isString),
    });
    const updatedProgressList: ProgressItem[] = documentList.map(
      ({ document_id: documentId, uri }) => {
        const item = data.find(d => d.document_id === documentId);
        return {
          ...item,
          documentId: documentId ?? '',
          progress: item?.progress ?? 0,
          name: item?.document_name ?? '',
          uri: uri ?? '',
          status: item?.status ?? DocumentStatus.Processing,
          statusDesc: item?.status_descript ?? '',
          remainingTime: (item?.remaining_time ?? 0) as number,
        };
      },
    );
    reportFailGetProgress(data);
    options.onProgressing(updatedProgressList);

    if (isStopPolling(data)) {
      options.onFinish();
      return;
    }
    pollingId.current = window.setTimeout(
      () => pollingTaskProgressInternal(documentList, options),
      POLLING_TIME,
    );
  };
  return pollingTaskProgressInternal;
};

export const useCreateDocument = <
  T extends UploadBaseState<number> & UploadBaseAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
  options?: {
    onSuccess?: (res: CreateDocumentResponse) => void;
    onFail?: (error: Error) => void;
  },
) => {
  const params = useKnowledgeParams();
  const setCreateStatus = useStore(state => state.setCreateStatus);
  const setProgressList = useStore(state => state.setProgressList);
  const pollingTaskProgress = usePollingTaskProgress();
  const { run: createDocument } = useRequest(
    async (reqParams: CreateDocumentRequest) => {
      try {
        const res = await KnowledgeApi.CreateDocument({
          dataset_id: params.datasetID,
          ...reqParams,
        });
        const { document_infos = [] } = res;
        if (document_infos.length) {
          await pollingTaskProgress(document_infos, {
            onProgressing: (progressList: ProgressItem[]) => {
              setProgressList(progressList);
            },
            onFinish: () => {
              setCreateStatus(CreateUnitStatus.TASK_FINISH);
            },
          });
        }
        options?.onSuccess && options.onSuccess(res);
      } catch (e) {
        // Failed to create, default rendering of processed data
        const error = e as Error;
        const fakeProgressList = reqParams?.document_bases?.map(item => ({
          ...item,
          name: item?.name || 'unknown',
          documentId: '',
          uri: '',
          remainingTime: 0,
          remaining_time: 0,
          progress: 100,
          status: DocumentStatus.Failed,
          statusDesc: error?.message,
          format_type: reqParams?.format_type,
        }));
        setProgressList(fakeProgressList || []);
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateDocument,
          error,
        });
        options?.onFail && options.onFail(error);
      }
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateDocument,
          error,
        });
        options?.onFail && options.onFail(error);
      },
      manual: true,
    },
  );
  return createDocument;
};

export const useTextDisplaySegmentStepCheck = (): [
  React.ReactElement | undefined,
  CheckedStatus,
] => {
  const checkStatus = useRef<CheckedStatus>(CheckedStatus.SIMPLE);
  const listDocumentReq = useListDocumentReq(res => {
    if (res?.total === 0) {
      checkStatus.current = CheckedStatus.HAD_SEGMENT_RULES;
    }
  });
  const params = useKnowledgeParams();

  useEffect(() => {
    if (params.datasetID) {
      listDocumentReq({
        dataset_id: params.datasetID,
      });
    }
  }, [params.datasetID]);

  return [undefined, checkStatus.current];
};

export const useImageDisplayAnnotationStepCheck = (): [
  React.ReactElement | undefined,
  CheckedStatus,
] => {
  const checkStatus = useRef<CheckedStatus>(CheckedStatus.SIMPLE);
  const listDocumentReq = useListDocumentReq(res => {
    if (res?.total === 0) {
      checkStatus.current = CheckedStatus.HAD_SEGMENT_RULES;
    }
  });
  const params = useKnowledgeParams();

  useEffect(() => {
    if (params.datasetID) {
      listDocumentReq({
        dataset_id: params.datasetID,
      });
    }
  }, [params.datasetID]);

  return [undefined, checkStatus.current];
};
