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
            `/space/${params.spaceID}/${resource}/${resourceID}?${qs.stringify(query)}`,
            opts,
          ),
        upload: (query, opts) =>
          navigate(
            `/space/${params.spaceID}/knowledge/${params.datasetID}/upload?${qs.stringify(query)}`,
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
        // 默认'library'
        return <BizLibraryKnowledgeIDE />;
      })()}
    </KnowledgeParamsStoreProvider>
  );
};
