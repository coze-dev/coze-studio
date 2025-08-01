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

import { cloneDeep } from 'lodash-es';
import { type BotPluginWorkFlowItem } from '@coze-workflow/components';
import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  NodePanelSearchType,
  type NodePanelPlugin,
  type NodePanelSearchResponse,
  type Workflow,
} from '@coze-arch/bot-api/workflow_api';

import {
  NodeSearchSectionType,
  type NodeSearchCategoryData,
  type NodeSearchResult,
  type PluginNodeTemplate,
  type SubWorkflowNodeTemplate,
} from '@/typing';
import {
  createApiNodeInfo,
  createSubWorkflowNodeInfo,
} from '@/hooks/use-add-node-modal/helper';
export const formatWorkflow = (
  spaceId: string,
  workflow: Workflow,
): SubWorkflowNodeTemplate => {
  const { name, desc, url, workflow_id, plugin_id } = workflow;
  return {
    type: StandardNodeType.SubWorkflow,
    name,
    desc,
    icon_url: url,
    plugin_id,
    workflow_id: workflow_id ?? '',
    nodeJSON: createSubWorkflowNodeInfo({
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      workflowItem: {
        name,
        workflow_id,
        desc,
      } as BotPluginWorkFlowItem,
      spaceId,
      isImageflow: false,
      templateIcon: url,
    }),
  };
};

export const formatPlugin = (plugin: NodePanelPlugin): PluginNodeTemplate => {
  const {
    name = '',
    desc = '',
    icon = '',
    plugin_id,
    tool_list = [],
    version,
  } = plugin;
  return {
    plugin_id: plugin_id ?? '',
    name,
    desc,
    icon_url: icon,
    tools: tool_list.map(tool => {
      const { api_name, api_desc, api_id } = tool;
      return {
        type: StandardNodeType.Api,
        name: api_name,
        desc: api_desc,
        plugin_id,
        version,
        nodeJSON: createApiNodeInfo(
          {
            name: api_name,
            plugin_name: name,
            api_id,
            plugin_id,
            desc,
            version_ts: version,
          },
          icon,
        ),
      };
    }),
  };
};

export const formatBackendSearchResult = (
  spaceId: string,
  response: NodePanelSearchResponse,
): NodeSearchResult => {
  if (!response.data) {
    return [];
  }

  const panelData = response.data;
  const workflowCategoryData: Array<
    NodeSearchCategoryData<SubWorkflowNodeTemplate>
  > = [];
  if (panelData?.project_workflow?.workflow_list?.length) {
    const {
      workflow_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.project_workflow;
    workflowCategoryData.push({
      id: NodePanelSearchType.ProjectWorkflow,
      categoryName: I18n.t('workflow_0224_02', {
        source: I18n.t('wf_chatflow_106'),
      }),
      nodeList: workflow_list.map(wf => formatWorkflow(spaceId, wf)),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  if (panelData?.resource_workflow?.workflow_list?.length) {
    const {
      workflow_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.resource_workflow;
    workflowCategoryData.push({
      id: NodePanelSearchType.ResourceWorkflow,
      categoryName: I18n.t('workflow_0224_02', {
        source: I18n.t('navigation_workspace_library'),
      }),
      nodeList: workflow_list.map(wf => formatWorkflow(spaceId, wf)),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  const pluginCategoryData: Array<NodeSearchCategoryData<PluginNodeTemplate>> =
    [];

  if (panelData?.favorite_plugin?.plugin_list?.length) {
    const {
      plugin_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.favorite_plugin;
    pluginCategoryData.push({
      id: NodePanelSearchType.FavoritePlugin,
      categoryName: I18n.t('workflow_0224_03'),
      nodeList: plugin_list.map(formatPlugin),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  if (panelData?.project_plugin?.plugin_list?.length) {
    const {
      plugin_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.project_plugin;
    pluginCategoryData.push({
      id: NodePanelSearchType.ProjectPlugin,
      categoryName: I18n.t('workflow_0224_02', {
        source: I18n.t('wf_chatflow_106'),
      }),
      nodeList: plugin_list.map(formatPlugin),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  if (panelData?.resource_plugin?.plugin_list?.length) {
    const {
      plugin_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.resource_plugin;
    pluginCategoryData.push({
      id: NodePanelSearchType.ResourcePlugin,
      categoryName: I18n.t('workflow_0224_02', {
        source: I18n.t('navigation_workspace_library'),
      }),
      nodeList: plugin_list.map(formatPlugin),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  if (panelData?.store_plugin?.plugin_list?.length) {
    const {
      plugin_list,
      has_more = false,
      next_page_or_cursor,
    } = panelData.store_plugin;
    pluginCategoryData.push({
      id: NodePanelSearchType.StorePlugin,
      categoryName: I18n.t('workflow_0224_06'),
      nodeList: plugin_list.map(formatPlugin),
      hasMore: has_more,
      cursor: next_page_or_cursor,
    });
  }
  return [
    {
      name: I18n.t('Workflow'),
      data: workflowCategoryData,
      dataType: NodeSearchSectionType.SubWorkflow,
    },
    {
      name: I18n.t('project_ide_frame_plugin'),
      data: pluginCategoryData,
      dataType: NodeSearchSectionType.Plugin,
    },
  ].filter(item => item.data.length > 0) as NodeSearchResult;
};

export const mergeSearchResult = (
  searchType: NodePanelSearchType,
  prevSearchResult: NodeSearchResult,
  loadMoreData: NodeSearchResult,
) => {
  const copy = cloneDeep(prevSearchResult);
  for (const item of copy) {
    const { dataType } = item;
    for (const subItem of item.data) {
      const { id } = subItem;
      if (id === searchType || searchType === NodePanelSearchType.All) {
        const moreData = loadMoreData
          .find(i => i.dataType === dataType)
          ?.data?.find(i => i.id === id);
        if (moreData?.nodeList.length) {
          subItem.hasMore = moreData.hasMore;
          subItem.cursor = moreData.cursor;
          subItem.nodeList = [
            ...subItem.nodeList,
            ...moreData.nodeList,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as NodeSearchCategoryData<any>['nodeList'];
        } else {
          subItem.hasMore = false;
        }
      }
    }
  }
  return copy;
};
