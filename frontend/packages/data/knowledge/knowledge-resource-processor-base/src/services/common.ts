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

import { useRequest } from 'ahooks';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import type {
  CreateDocumentRequest,
  CreateDocumentResponse,
  ListDocumentResponse,
  ListDocumentRequest,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

export const useListDocumentReq = (
  onSuccess?: (res: ListDocumentResponse) => void,
  onError?: () => void,
) => {
  const { run: listDocument } = useRequest(
    async (params: ListDocumentRequest) => {
      const res = await KnowledgeApi.ListDocument(params);
      onSuccess && onSuccess(res);
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetTableInfo,
          error: error as Error,
        });
        onError && onError();
      },
      manual: true,
    },
  );

  return listDocument;
};

export const useCreateDocumentReq = (options?: {
  onSuccess?: (res: CreateDocumentResponse) => void;
  onFail?: (error: Error) => void;
}) => {
  const params = useKnowledgeParams();
  const { run: createDocument } = useRequest(
    async (req: CreateDocumentRequest) => {
      const res = await KnowledgeApi.CreateDocument({
        dataset_id: params.datasetID,
        ...req,
      });
      options?.onSuccess && options.onSuccess(res);
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
