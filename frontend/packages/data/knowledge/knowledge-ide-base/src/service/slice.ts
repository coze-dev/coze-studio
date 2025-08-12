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

import { type BasicTarget } from 'ahooks/lib/utils/domTarget';
import { useInfiniteScroll, useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  REPORT_EVENTS,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import {
  type CreateSliceRequest,
  type ListSliceRequest,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { type ISliceInfo } from '@/types/slice';

const pageSize = 50;
export interface UseScrollListSliceReqParams {
  params: ListSliceRequest;
  onSuccess?: (res: DatasetDataScrollList | undefined) => void;
  onError?: (e: Error) => void;
  reloadDeps: unknown[];
  target: BasicTarget;
  ready?: boolean;
  dataReady?: boolean;
}
export interface DatasetDataScrollList {
  list: ISliceInfo[];
  total: number;
  ready?: boolean;
  hasMore?: boolean;
}
export const useScrollListSliceReq = ({
  params,
  onSuccess,
  onError,
  reloadDeps = [],
  target = null,
  dataReady = true,
}: UseScrollListSliceReqParams) => {
  const { loading, data, loadingMore, mutate, cancel, reload, loadMore } =
    useInfiniteScroll<DatasetDataScrollList>(
      async d => {
        if (!params.dataset_id && !params.document_id) {
          return {
            list: [],
            total: 0,
            hasMore: false,
            ready: false,
          };
        }
        const isAllType = !!params.dataset_id;
        const lastSequence = d?.list?.length
          ? d.list[d.list.length - 1].sequence
          : undefined;
        const extendParams = isAllType
          ? {
              document_id:
                d && d?.list?.length
                  ? d.list[d.list.length - 1].document_id
                  : undefined,
              sequence: lastSequence,
            }
          : {
              sequence: lastSequence,
            };

        const resp = await KnowledgeApi.ListSlice({
          ...extendParams,
          page_size: String(pageSize),
          ...params,
        });
        return {
          list: resp?.slices || [],
          total: Number(resp?.total ?? 0),
          hasMore: resp?.hasmore,
          ready: true,
        };
      },
      {
        isNoMore: res => Boolean(!res?.hasMore),
        target,
        onBefore: () => {
          if (loadingMore || loading) {
            cancel();
          }
        },
        onSuccess,
        onError,
        reloadDeps,
      },
    );
  return {
    loading,
    data,
    loadingMore,
    mutate,
    cancel,
    reload,
    loadMore,
    pageSize,
  };
};

export const delSlice = async (sliceIds: string[]) => {
  if (!sliceIds || !sliceIds.length) {
    throw new CustomError(
      ReportEventNames.KnowledgeDeleteSlice,
      `${ReportEventNames.KnowledgeDeleteSlice}: missing slice_id`,
    );
  }
  await KnowledgeApi.DeleteSlice({
    slice_ids: sliceIds,
  });

  return sliceIds;
};

export const updateSlice = async (
  sliceId: string,
  updateContent: string,
  updateValue?: string,
) => {
  if (!sliceId) {
    throw new CustomError('normal_error', 'missing slice_id');
  }
  await KnowledgeApi.UpdateSlice({
    slice_id: sliceId,
    raw_text: updateContent,
    table_unit_text: updateValue,
  });
  Toast.success(I18n.t('Update_success'));

  return updateContent;
};
export const useCreateSlice = ({ onReload }) => {
  const { run: createSlice } = useRequest(
    async (params: CreateSliceRequest) => {
      if (!params.document_id) {
        throw new CustomError('normal_error', 'missing doc_id');
      }

      const data = await KnowledgeApi.CreateSlice(params);
      return {
        ...data,
        ...params,
      };
    },
    {
      manual: true,
      onSuccess: data => {
        Toast.success(I18n.t('Update_success'));
        onReload({
          document_id: data.document_id,
          slice_id: data.slice_id,
          sequence: '0',
          content: data.raw_text ?? {},
        });
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateSlice,
          error,
        });
      },
    },
  );
  return {
    createSlice,
  };
};
