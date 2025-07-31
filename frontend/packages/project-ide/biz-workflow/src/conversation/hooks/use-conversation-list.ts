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

import { useState } from 'react';

import {
  type ProjectConversation,
  type ListProjectConversationRequest,
  CreateMethod,
  CreateEnv,
} from '@coze-arch/bot-api/workflow_api';
import { workflowApi } from '@coze-arch/bot-api';
import { useIDEGlobalStore } from '@coze-project-ide/framework';

export const MAX_LIMIT = 1000;

type ListProjectConversationDefParams = Pick<
  ListProjectConversationRequest,
  'create_env' | 'create_method'
> & {
  connector_id: string;
};

type ConversationListWithConnectorParams = Pick<
  ListProjectConversationDefParams,
  'connector_id' | 'create_env'
>;

const useConversationList = (params: ListProjectConversationDefParams) => {
  const { spaceId, projectId, version } = useIDEGlobalStore(store => ({
    spaceId: store.spaceId,
    projectId: store.projectId,
    version: store.version,
  }));

  const [list, setList] = useState<ProjectConversation[]>([]);

  const fetch = async () => {
    const staticList = await workflowApi.ListProjectConversationDef({
      space_id: spaceId,
      project_id: projectId,
      project_version: version,
      create_method: CreateMethod.ManualCreate,
      create_env: CreateEnv.Release,
      limit: MAX_LIMIT,
      ...params,
    });
    setList(staticList.data || []);
  };

  return {
    list,
    fetch,
  };
};

export const useConversationListWithConnector = (
  params: ConversationListWithConnectorParams,
) => {
  // static
  const { list: staticList, fetch: fetchStatic } = useConversationList({
    create_method: CreateMethod.ManualCreate,
    ...params,
  });
  // dynamic
  const { list: dynamicList, fetch: fetchDynamic } = useConversationList({
    create_method: CreateMethod.NodeCreate,
    ...params,
  });

  const fetch = () => {
    fetchStatic();
    fetchDynamic();
  };

  return {
    staticList,
    dynamicList,
    fetch,
  };
};
