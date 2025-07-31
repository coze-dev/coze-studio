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

import { type FC, type MouseEvent } from 'react';

import semver from 'semver';
import { cloneDeep, get, set } from 'lodash-es';
import { type StandardNodeType } from '@coze-workflow/base';

import { getWorkflowVersionByPluginId } from '@/utils';
import {
  type NodeSearchCategoryData,
  type SubWorkflowNodeTemplate,
} from '@/typing';
import { useGlobalState, useNodeVersionService } from '@/hooks';

import { NodeCategoryPanel } from '../node-category-panel';
import { LoadMoreCard } from '../load-more-card';
import { CustomDragCard } from '../custom-drag-card';
import { NodeCard } from '../card';
import { useNodePanelContext } from '../../hooks/node-panel-context';

export interface SubWorkflowCategoryListProps {
  data: Array<NodeSearchCategoryData<SubWorkflowNodeTemplate>>;
}
export const SubWorkflowCategoryList: FC<SubWorkflowCategoryListProps> = ({
  data,
}) => {
  const { keyword, enableDrag, onSelect, onLoadMore, onAddingNode } =
    useNodePanelContext();
  const { spaceId } = useGlobalState();
  const nodeVersionService = useNodeVersionService();

  const handleSelect = async ({
    event,
    nodeTemplate,
  }: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: SubWorkflowNodeTemplate;
  }) => {
    if (!nodeTemplate.plugin_id || nodeTemplate.plugin_id === '0') {
      onSelect?.({ event, nodeTemplate });
      return;
    }

    try {
      onAddingNode?.(true);
      // Complete version information
      const versionName = await getWorkflowVersionByPluginId({
        spaceId,
        pluginId: nodeTemplate.plugin_id,
      });
      if (versionName && semver.valid(versionName)) {
        if (
          !(await nodeVersionService.addSubWorkflowCheck(
            nodeTemplate.workflow_id,
            versionName,
          ))
        ) {
          return;
        }

        const copy = cloneDeep(nodeTemplate);
        set(copy, 'nodeJSON.data.inputs.workflowVersion', versionName);
        onSelect?.({ event, nodeTemplate: copy });
      }
    } finally {
      onAddingNode?.(false);
    }
  };
  return (
    <>
      {data.map(({ id, categoryName, nodeList, hasMore, cursor }) => (
        <NodeCategoryPanel key={id} categoryName={categoryName}>
          {nodeList.map((nodeTemplate, index) => (
            <CustomDragCard
              key={`${nodeTemplate?.type}_${nodeTemplate.name}`}
              tooltipPosition={index % 2 === 0 ? 'left' : 'right'}
              nodeType={nodeTemplate?.type as StandardNodeType}
              nodeDesc={get(nodeTemplate, 'desc')}
              nodeJson={get(nodeTemplate, 'nodeJSON')}
              nodeTemplate={nodeTemplate}
              disabled={!enableDrag}
            >
              <NodeCard
                name={nodeTemplate.name ?? ''}
                icon={nodeTemplate.icon_url ?? ''}
                keyword={keyword}
                onClick={event => handleSelect({ event, nodeTemplate })}
              />
            </CustomDragCard>
          ))}
          {hasMore ? (
            <LoadMoreCard
              onLoadMore={async () => {
                await onLoadMore?.(id, cursor);
              }}
            />
          ) : null}
        </NodeCategoryPanel>
      ))}
    </>
  );
};
