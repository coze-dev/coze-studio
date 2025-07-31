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
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { FormatType } from '@coze-arch/idl/knowledge';
import { WorkflowMode } from '@coze-arch/idl/developer_api';
import { useDatasetStore } from '@coze-data/knowledge-data-set-for-agent';
import { type ILibraryItem } from '@coze-common/editor-plugins/library-insert';

const useAddPluginLibrary = () => {
  const { pluginApis, updateSkillPluginApis } = useBotSkillStore(
    useShallow(store => ({
      pluginApis: store.pluginApis,
      updateSkillPluginApis: store.updateSkillPluginApis,
    })),
  );
  return (library: ILibraryItem) => {
    updateSkillPluginApis([
      ...pluginApis,
      {
        ...library.detail_info?.plugin_detail,
      },
    ]);
  };
};

const useAddWorkflowLibrary = () => {
  const { workflows, updateSkillWorkflows } = useBotSkillStore(
    useShallow(store => ({
      workflows: store.workflows,
      updateSkillWorkflows: store.updateSkillWorkflows,
    })),
  );
  return (library: ILibraryItem) => {
    const appendWorkflow = library.detail_info?.workflow_detail ?? {};
    const allWorkflows = workflows.concat(appendWorkflow as WorkFlowItemType);
    updateSkillWorkflows(allWorkflows);
  };
};

const useAddImageFlowLibrary = () => {
  const { workflows, updateSkillWorkflows } = useBotSkillStore(
    useShallow(store => ({
      workflows: store.workflows,
      updateSkillWorkflows: store.updateSkillWorkflows,
    })),
  );
  return (library: ILibraryItem) => {
    const appendWorkflow = library.detail_info?.workflow_detail ?? {};
    const allWorkflows = workflows
      .filter(
        item =>
          (item.flow_mode || WorkflowMode.Workflow) !== WorkflowMode.Imageflow,
      )
      .concat(appendWorkflow as WorkFlowItemType);
    updateSkillWorkflows(allWorkflows);
  };
};

const useAddKnowledgeLibrary = () => {
  const { knowledge, updateSkillKnowledgeDatasetList } = useBotSkillStore(
    useShallow(store => ({
      knowledge: store.knowledge,
      updateSkillKnowledgeDatasetList: store.updateSkillKnowledgeDatasetList,
    })),
  );
  const { dataSetList, setDataSetList } = useDatasetStore(
    useShallow(state => ({
      dataSetList: state.dataSetList,
      setDataSetList: state.setDataSetList,
    })),
  );
  return (library: ILibraryItem) => {
    const formatTypeMap = {
      text: FormatType.Text,
      table: FormatType.Table,
      image: FormatType.Image,
    };
    setDataSetList([
      ...dataSetList,
      {
        dataset_id: library.id,
        name: library.name,
        format_type: formatTypeMap[library.type] ?? FormatType.Text,
        description: library.desc,
        icon_url: library.icon_url,
      },
    ]);
    updateSkillKnowledgeDatasetList([
      ...knowledge.dataSetList,
      {
        dataset_id: library.id,
        name: library.name,
        description: library.desc,
      },
    ]);
  };
};
export const useAddLibrary = () => {
  const addPluginLibrary = useAddPluginLibrary();
  const addWorkflowLibrary = useAddWorkflowLibrary();
  const addImageFlowLibrary = useAddImageFlowLibrary();
  const addKnowledgeLibrary = useAddKnowledgeLibrary();
  return (library: ILibraryItem) => {
    if (library.type === 'plugin') {
      addPluginLibrary(library);
      return;
    }
    if (library.type === 'workflow') {
      addWorkflowLibrary(library);
      return;
    }
    if (library.type === 'imageflow') {
      addImageFlowLibrary(library);
      return;
    }
    if (['text', 'table', 'image'].includes(library.type)) {
      addKnowledgeLibrary(library);
      return;
    }
  };
};
