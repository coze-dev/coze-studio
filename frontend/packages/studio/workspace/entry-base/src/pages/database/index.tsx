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
import React from 'react';

import qs from 'qs';
import {
  KnowledgeParamsStoreProvider,
  type IKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { DatabaseDetail } from '@coze-data/database-v2';

const DatabaseDetailPage = () => {
  const urlParams = useParams();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const params: IKnowledgeParams = {
    botID: queryParams.get('bot_id') || '',
    pageMode: (queryParams.get('page_mode') ||
      'normal') as IKnowledgeParams['pageMode'],
    biz: (queryParams.get('biz') || 'library') as IKnowledgeParams['biz'],
    workflowID: queryParams.get('workflow_id') || '',
    agentID: queryParams.get('agent_id') || '',
    tableID: urlParams.table_id || '',
    initialTab: (queryParams.get('initial_tab') ||
      'structure') as IKnowledgeParams['initialTab'],
  };

  return (
    <KnowledgeParamsStoreProvider
      params={params}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, resourceID, query, opts) =>
          navigate(
            `/space/${params.spaceID}/${resource}/${resourceID}?${qs.stringify(
              query,
            )}`,
            opts,
          ),
      }}
    >
      <DatabaseDetail />
    </KnowledgeParamsStoreProvider>
  );
};

export default DatabaseDetailPage;
