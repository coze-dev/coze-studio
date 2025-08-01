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

import { useNavigate, useParams } from 'react-router-dom';

import qs from 'qs';
import { KnowledgeParamsStoreProvider } from '@coze-data/knowledge-stores';
import {
  type UnitType,
  type OptType,
} from '@coze-data/knowledge-resource-processor-core';
import { type ActionType } from '@coze-data/knowledge-ide-base/types';
import {
  BizAgentKnowledgeIDE,
  BizLibraryKnowledgeIDE,
  BizProjectKnowledgeIDE,
  BizWorkflowKnowledgeIDE,
} from '@coze-data/knowledge-ide-adapter';
import { useSpaceStore } from '@coze-arch/bot-studio-store';

export const KnowledgePreviewPage = () => {
  const { dataset_id, space_id } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const params = {
    datasetID: dataset_id ?? '',
    spaceID: space_id ?? '',
    type: searchParams.get('type') as UnitType,
    opt: searchParams.get('opt') as OptType,
    docID: searchParams.get('doc_id') ?? '',
    pageMode: searchParams.get('page_mode') as 'modal' | 'normal',
    biz: searchParams.get('biz') as
      | 'agentIDE'
      | 'workflow'
      | 'project'
      | 'library',
    botID: searchParams.get('bot_id') ?? '',
    workflowID: searchParams.get('workflow_id') ?? '',
    agentID: searchParams.get('agent_id') ?? '',
    actionType: searchParams.get('action_type') as ActionType,
    first_auto_open_edit_document_id:
      searchParams.get('first_auto_open_edit_document_id') ?? '',
    create: searchParams.get('create') ?? '',
  };
  const navigate = useNavigate();
  const spaceID = useSpaceStore(store => store.space.id);
  return (
    <KnowledgeParamsStoreProvider
      params={{ ...params, spaceID }}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, resourceID, query, opts) =>
          navigate(
            `/space/${params.spaceID}/${resource}/${resourceID}?${qs.stringify(
              query,
            )}`,
            opts,
          ),
        upload: (query, opts) =>
          navigate(
            `/space/${params.spaceID}/knowledge/${
              params.datasetID
            }/upload?${qs.stringify(query)}`,
            opts,
          ),
      }}
    >
      {(() => {
        if (params.biz === 'agentIDE') {
          return <BizAgentKnowledgeIDE />;
        }
        if (params.biz === 'workflow') {
          return <BizWorkflowKnowledgeIDE />;
        }
        if (params.biz === 'project') {
          return <BizProjectKnowledgeIDE />;
        }
        // Default'library'
        return <BizLibraryKnowledgeIDE />;
      })()}
    </KnowledgeParamsStoreProvider>
  );
};
