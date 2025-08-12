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
import { useRequest } from 'ahooks';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { useProcessingStore } from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { CustomError } from '@coze-arch/bot-error';
import { Toast } from '@coze-arch/coze-design';

const POLLING_TIME = 1000;

export const useListDataSetReq = (params: { datasetID: string }) => {
  const spaceId = useSpaceStore(s => s.space.id);
  const cacheKey = `dataset-${params.datasetID}`;
  const capture = useErrorHandler();
  return useRequest(
    async () => {
      if (!params.datasetID) {
        throw new CustomError(
          'useListDataSetReq_error',
          'datasetid cannot be empty',
        );
      }
      const res = await KnowledgeApi.ListDataset({
        filter: {
          dataset_ids: [params.datasetID],
        },
        space_id: spaceId,
      });

      if (res?.total) {
        return res?.dataset_list?.find(i => i.dataset_id === params.datasetID);
      } else if (res?.total !== 0) {
        capture(new CustomError('useListDataSetReq_error', res.msg || ''));
      }
    },
    {
      cacheKey,
      setCache: data => sessionStorage.setItem(cacheKey, JSON.stringify(data)),
      getCache: () => JSON.parse(sessionStorage.getItem(cacheKey) || '{}'),
      onError: error => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
        capture(error);
      },
    },
  );
};
export const useDataSetDetailReq = (
  onSuccess?: (res: Dataset | undefined) => void,
  onError?: () => void,
) => {
  const capture = useErrorHandler();
  const spaceId = useSpaceStore(s => s.space.id);
  const { data, run, loading, mutate } = useRequest(
    async ({ datasetID }: { datasetID: string }) => {
      if (!datasetID) {
        throw new CustomError(
          'useDataSetDetailReq_error',
          'datasetid cannot be empty',
        );
      }
      try {
        const res = await KnowledgeApi.DatasetDetail({
          dataset_ids: [datasetID],
          space_id: spaceId,
        });
        const curDatasetDetail = res?.dataset_details?.[datasetID];
        if (curDatasetDetail) {
          onSuccess?.(curDatasetDetail);
          return curDatasetDetail;
        }
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

export const usePollingDatasetProcess = () => {
  const capture = useErrorHandler();
  const { addProcessingDataset, deleteProcessingDataset } = useProcessingStore(
    useShallow(store => ({
      addProcessingDataset: store.addProcessingDataset,
      deleteProcessingDataset: store.deleteProcessingDataset,
    })),
  );
  const spaceId = useSpaceStore(s => s.space.id);

  const { run: startPollingProcess, cancel: cancelPollingProcess } = useRequest(
    async ({ datasetID }: { datasetID: string }) => {
      if (!datasetID) {
        throw new CustomError(
          'useDataSetDetailReq_error',
          'datasetid cannot be empty',
        );
      }
      try {
        const res = await KnowledgeApi.DatasetDetail({
          dataset_ids: [datasetID],
          space_id: spaceId,
        });
        const curDatasetDetail = res?.dataset_details?.[datasetID];
        if (
          curDatasetDetail &&
          // @ts-expect-error -- linter-disable-autofix
          curDatasetDetail.processing_file_id_list?.length > 0
        ) {
          addProcessingDataset(datasetID);
        } else {
          deleteProcessingDataset(datasetID);
          cancelPollingProcess();
        }
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
      pollingInterval: POLLING_TIME,
      onError: error => {
        Toast.error({
          content: I18n.t('Network_error'),
          showClose: false,
        });
        capture(error);
      },
    },
  );
  return {
    startPollingProcess,
    cancelPollingProcess,
  };
};
