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

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';
import { FormatType } from '@coze-arch/bot-api/knowledge';
import { useDatasetStore } from '@coze-data/knowledge-data-set-for-agent';
import { type ILibraryList } from '@coze-common/editor-plugins/library-insert';

export const useGetLibrarysData = () => {
  const { plugins, workflows } = useBotSkillStore(
    useShallow(state => ({
      plugins: state.pluginApis,
      workflows: state.workflows,
    })),
  );
  const { dataSetList } = useDatasetStore(
    useShallow(state => ({
      dataSetList: state.dataSetList,
    })),
  );
  const libraryList = useMemo<ILibraryList>(
    () => [
      {
        type: 'plugin',
        items: plugins.map(plugin => ({
          ...plugin,
          type: 'plugin',
          id: String(plugin.plugin_id),
          icon_url: String(plugin.plugin_icon),
          desc: String(plugin.desc),
          name: String(plugin.name),
        })),
      },
      {
        type: 'workflow',
        items: workflows.map(workflow => ({
          ...workflow,
          type: 'workflow',
          id: workflow.workflow_id,
          icon_url: workflow.plugin_icon,
          desc: workflow.desc,
          name: workflow.name,
        })),
      },
      {
        type: 'imageflow',
        items: workflows
          .filter(workflow => workflow.flow_mode === WorkflowMode.Imageflow)
          .map(workflow => ({
            ...workflow,
            id: workflow.workflow_id,
            type: 'workflow',
            icon_url: workflow.plugin_icon,
            desc: workflow.desc,
            name: workflow.name,
          })),
      },
      {
        type: 'image',
        items: dataSetList
          .filter(item => item.format_type === FormatType.Image)
          .map(item => ({
            ...item,
            id: String(item.dataset_id),
            type: 'image',
            icon_url: String(item.icon_url),
            desc: String(item.description),
            name: String(item.name),
          })),
      },
      {
        type: 'table',
        items: dataSetList
          .filter(item => item.format_type === FormatType.Table)
          .map(item => ({
            ...item,
            id: String(item.dataset_id),
            type: 'table',
            icon_url: String(item.icon_url),
            desc: String(item.description),
            name: String(item.name),
          })),
      },
      {
        type: 'text',
        items: dataSetList
          .filter(item => item.format_type === FormatType.Text)
          .map(item => ({
            ...item,
            id: String(item.dataset_id),
            type: 'text',
            icon_url: String(item.icon_url),
            desc: String(item.description),
            name: String(item.name),
          })),
      },
    ],
    [plugins, workflows, dataSetList],
  );
  return { libraryList };
};
