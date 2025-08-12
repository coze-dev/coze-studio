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

import React from 'react';

import qs from 'qs';
import {
  useTitle,
  useCurrentWidgetContext,
  useIDEParams,
  useIDENavigate,
  useSpaceId,
  useProjectId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import { KnowledgeParamsStoreProvider } from '@coze-data/knowledge-stores';
import {
  type UnitType,
  type OptType,
} from '@coze-data/knowledge-resource-processor-core';
import { DatabaseDetail, type DatabaseTabs } from '@coze-data/database-v2';

const Main = () => {
  const spaceID = useSpaceId();
  const projectID = useProjectId();
  const { uri, widget } = useCurrentWidgetContext();
  const IDENav = useIDENavigate();
  const title = useTitle();
  const { version } = useCommitVersion();

  const refetch = usePrimarySidebarStore(state => state.refetch);

  const queryObject = useIDEParams();

  const { type, opt, doc_id, page_mode, bot_id, workflow_id, agent_id, tab } =
    queryObject;

  return (
    <KnowledgeParamsStoreProvider
      params={{
        version,
        projectID,
        spaceID,
        tableID: uri?.path.name ?? '',
        type: type as UnitType,
        opt: opt as OptType,
        docID: doc_id,
        pageMode: page_mode as 'modal' | 'normal',
        biz: 'project',
        botID: bot_id,
        workflowID: workflow_id,
        agentID: agent_id,
      }}
      onUpdateDisplayName={displayName => {
        widget.setTitle(displayName); // Set tab title
        if (displayName && displayName !== title) {
          refetch(); // Update sidebar name
        }
      }}
      onStatusChange={status => {
        widget.setUIState(status);
      }}
      resourceNavigate={{
        // eslint-disable-next-line max-params
        toResource: (resource, resourceID, query, opts) =>
          IDENav(`/${resource}/${resourceID}?${qs.stringify(query)}`, opts),
      }}
    >
      <DatabaseDetail
        needHideCloseIcon
        initialTab={tab as DatabaseTabs}
        version={version}
      />
    </KnowledgeParamsStoreProvider>
  );
};

export default Main;
