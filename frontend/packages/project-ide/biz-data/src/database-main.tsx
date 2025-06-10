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
        widget.setTitle(displayName); // 设置 tab 标题
        if (displayName && displayName !== title) {
          refetch(); // 更新侧边栏 name
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
