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
  useProjectId,
  useSpaceId,
  useCommitVersion,
} from '@coze-project-ide/framework';
import { usePrimarySidebarStore } from '@coze-project-ide/biz-components';
import { KnowledgeParamsStoreProvider } from '@coze-data/knowledge-stores';
import {
  UnitType,
  OptType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  getUploadConfig,
  KnowledgeResourceProcessor,
} from '@coze-data/knowledge-resource-processor-adapter';
import { type ActionType } from '@coze-data/knowledge-ide-base/types';
import { BizProjectKnowledgeIDE } from '@coze-data/knowledge-ide-adapter';

const Main = () => {
  const spaceID = useSpaceId();
  const { uri, widget } = useCurrentWidgetContext();
  const IDENav = useIDENavigate();
  const title = useTitle();
  const { version } = useCommitVersion();

  const projectID = useProjectId();

  const refetch = usePrimarySidebarStore(state => state.refetch);

  const queryObject = useIDEParams();

  const {
    type,
    opt,
    doc_id,
    page_mode,
    biz,
    bot_id,
    workflow_id,
    agent_id,
    module,
    action_type,
    first_auto_open_edit_document_id,
    create,
  } = queryObject;

  const uploadConfig = getUploadConfig(
    (type as UnitType) ?? UnitType.TEXT,
    (opt as OptType) ?? OptType.ADD,
  );

  const datasetID = uri?.path.name ?? '';

  return (
    <KnowledgeParamsStoreProvider
      params={{
        version,
        projectID,
        datasetID,
        spaceID,
        type: type as UnitType,
        opt: opt as OptType,
        docID: doc_id,
        pageMode: page_mode as 'modal' | 'normal',
        biz:
          (biz as 'agentIDE' | 'workflow' | 'project' | undefined) ?? 'project',
        botID: bot_id,
        workflowID: workflow_id,
        agentID: agent_id,
        actionType: action_type as ActionType,
        first_auto_open_edit_document_id,
        create,
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
        upload: (query, opts) => {
          IDENav(
            `/knowledge/${datasetID}?module=upload&${qs.stringify(query)}`,
            opts,
          );
        },
      }}
    >
      {module === 'upload' ? (
        uploadConfig ? (
          <KnowledgeResourceProcessor
            keepDocTitle
            uploadConfig={uploadConfig}
          />
        ) : null
      ) : (
        <BizProjectKnowledgeIDE layoutProps={{ keepDocTitle: true }} />
      )}
    </KnowledgeParamsStoreProvider>
  );
};

export default Main;
