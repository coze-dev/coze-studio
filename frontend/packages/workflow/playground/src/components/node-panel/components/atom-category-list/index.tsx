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

import { type FC } from 'react';

import { get } from 'lodash-es';
import { type StandardNodeType } from '@coze-workflow/base';

import { isPluginCategoryNodeTemplate } from '@/utils';
import { type NodeCategory } from '@/typing';

import { NodeCategoryPanel } from '../node-category-panel';
import { CustomDragCard } from '../custom-drag-card';
import { NodeCard } from '../card';
import { useNodePanelContext } from '../../hooks/node-panel-context';

export interface AtomCategoryListProps {
  data: NodeCategory[];
}

export const AtomCategoryList: FC<AtomCategoryListProps> = ({ data }) => {
  const { keyword, enableDrag, onSelect } = useNodePanelContext();

  return (
    <>
      {data.map(({ categoryName, nodeList }) => (
        <NodeCategoryPanel key={categoryName} categoryName={categoryName}>
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
                hideOutline={isPluginCategoryNodeTemplate(nodeTemplate)}
                keyword={keyword}
                onClick={event => onSelect?.({ event, nodeTemplate })}
              />
            </CustomDragCard>
          ))}
        </NodeCategoryPanel>
      ))}
    </>
  );
};
