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

import { get } from 'lodash-es';
import { type StandardNodeType, concatTestId } from '@coze-workflow/base';
import { Typography } from '@coze-arch/coze-design';

import { isPluginCategoryNodeTemplate } from '@/utils';
import { type NodeCategory, type UnionNodeTemplate } from '@/typing';

import { CustomDragCard } from './custom-drag-card';
import { NodeCard } from './card';

import styles from './styles.module.less';
export interface AtomNodeListProps {
  data: NodeCategory[];
  enableDrag?: boolean;
  keyword?: string;
  onSelect: (props: {
    event: MouseEvent<HTMLElement>;
    nodeTemplate: UnionNodeTemplate;
  }) => void;
}
export const AtomNodeList: FC<AtomNodeListProps> = ({
  data,
  onSelect,
  enableDrag,
  keyword,
}) => (
  <>
    {data.map(({ categoryName, nodeList }) => (
      <>
        {categoryName ? (
          <Typography.Text
            key={`${categoryName}_title`}
            className="block coz-fg-secondary leading-5 mt-3 mb-1 font-['PICO_Sans_VFE_SC']"
            weight={500}
            size="normal"
            data-testid={concatTestId(
              'workflow.detail.node-panel.list.category.name',
              categoryName,
            )}
          >
            {categoryName}
          </Typography.Text>
        ) : null}
        <div
          key={`${categoryName}_list`}
          className={styles['node-category-list']}
          data-testid="workflow.detail.node-panel.list.category.list"
        >
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
                onClick={event => onSelect({ event, nodeTemplate })}
              />
            </CustomDragCard>
          ))}
        </div>
      </>
    ))}
  </>
);
