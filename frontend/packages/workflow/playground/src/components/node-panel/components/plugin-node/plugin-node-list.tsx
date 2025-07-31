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

import { type FC, useState, useMemo, type MouseEvent } from 'react';

import { isNumber } from 'lodash-es';
import classNames from 'classnames';
import { StandardNodeType, concatTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import {
  type UnionNodeTemplate,
  type PluginApiNodeTemplate,
  type PluginNodeTemplate,
} from '@/typing';
import { useNodeVersionService } from '@/hooks';

import { LoadMoreCard } from '../load-more-card';
import { CustomDragCard } from '../custom-drag-card';
import { useNodePanelContext } from '../../hooks/node-panel-context';
import {
  PAGE_SIZE as INIT_PAGE_SIZE,
  LOAD_MORE_PAGE_SIZE,
  LOAD_MORE_PLACEHOLDER,
} from '../../constant';
import { PluginToolCard } from './plugin-tool-card';
import { PluginNode } from './plugin-node';

import styles from './styles.module.less';
export interface PluginNodeListProps {
  pluginNodeList: PluginNodeTemplate[];
  hasMore?: boolean;
  onLoadMore: () => Promise<void>;
  showExploreMore?: boolean;
  categoryName: string;
}

export type LoadMorePlaceholder = typeof LOAD_MORE_PLACEHOLDER;
export type PluginNodeListWithLoadMore = Array<
  PluginNodeTemplate | LoadMorePlaceholder
>;
export const PluginNodeList: FC<PluginNodeListProps> = ({
  pluginNodeList,
  hasMore,
  onLoadMore,
  showExploreMore,
  categoryName,
}) => {
  const { keyword, enableDrag, onSelect, onAddingNode } = useNodePanelContext();

  // Calculate the list of nodes to be displayed, 5 on the first page, and 4 on each subsequent page (5, 5 + 4, 5 + 4 + 4, 5 + 4 + 4 + 4...)
  const displayPluginNodeList = useMemo<PluginNodeListWithLoadMore>(() => {
    const nodeList: PluginNodeListWithLoadMore = pluginNodeList;
    if (!nodeList) {
      return nodeList;
    }
    const len = nodeList.length;
    if (!hasMore || len < INIT_PAGE_SIZE) {
      return nodeList;
    }
    const rawPageNum = (len - INIT_PAGE_SIZE) / LOAD_MORE_PAGE_SIZE;
    // If rawPageNum has a fractional part,
    if (rawPageNum % 1 > 0) {
      const displayLen =
        Math.floor(rawPageNum) * LOAD_MORE_PAGE_SIZE + INIT_PAGE_SIZE;
      return nodeList.slice(0, displayLen).concat(LOAD_MORE_PLACEHOLDER);
    }
    return nodeList.concat(LOAD_MORE_PLACEHOLDER);
  }, [pluginNodeList, hasMore]);

  const [expandPluginIndex, setExpandPluginIndex] = useState<number>();
  // Tools list insert location
  const pluginToolsDisplayIndex = useMemo<number | undefined>(() => {
    if (!isNumber(expandPluginIndex)) {
      return;
    }
    if (expandPluginIndex % 2 === 0) {
      return Math.min(
        expandPluginIndex + 1,
        (displayPluginNodeList?.length ?? 0) - 1,
      );
    }
    return expandPluginIndex;
  }, [expandPluginIndex, displayPluginNodeList]);

  const pluginTools = useMemo<PluginApiNodeTemplate[] | undefined>(
    () =>
      isNumber(expandPluginIndex) &&
      ((displayPluginNodeList?.[expandPluginIndex] as PluginNodeTemplate)?.tools
        ?.length ?? 0) > 1
        ? (displayPluginNodeList?.[expandPluginIndex] as PluginNodeTemplate)
            ?.tools
        : undefined,
    [expandPluginIndex, displayPluginNodeList],
  );
  const nodeVersionService = useNodeVersionService();
  const handleSelectTool = async (
    event: MouseEvent<HTMLElement>,
    nodeTemplate: PluginApiNodeTemplate,
  ) => {
    try {
      onAddingNode?.(true);
      const { plugin_id: pluginId, version } = nodeTemplate;
      if (!(await nodeVersionService.addApiCheck(pluginId, version))) {
        return false;
      }
      onSelect?.({ event, nodeTemplate });
    } finally {
      onAddingNode?.(false);
    }
  };
  if (!displayPluginNodeList?.length) {
    return null;
  }
  return (
    <div className={styles['plugin-node-list-container']}>
      <div
        className={classNames(
          'flex flex-row pl-1 mb-1 items-center leading-5',
          styles['plugin-node-list-header'],
        )}
      >
        <Typography.Text
          className="coz-fg-secondary leading-5"
          weight={500}
          size="normal"
          data-testid={concatTestId(
            'workflow.detail.node-panel.list.category.name',
            'favorite-plugin',
          )}
        >
          {categoryName}
        </Typography.Text>
        {showExploreMore ? (
          <div
            className={classNames(
              'flex-row items-center cursor-pointer',
              styles['explore-more'],
            )}
            onClick={e => {
              const nodeTemp: UnionNodeTemplate = {
                type: StandardNodeType.Api,
              };
              onSelect?.({
                event: e,
                nodeTemplate: nodeTemp,
              });
            }}
          >
            <div className="w-[1px] h-3 mx-2 coz-stroke-primary border-l-[1px] border-r-0 border-solid" />
            <Typography.Text
              className="coz-fg-secondary leading-5"
              size="normal"
              weight={500}
            >
              {I18n.t('workflow_0224_04')}
            </Typography.Text>
            <IconCozArrowRight className="coz-fg-secondary text-[16px]" />
          </div>
        ) : null}
      </div>
      <div
        className={styles['plugin-node-list']}
        data-testid="workflow.detail.node-panel.list.category.list"
      >
        {displayPluginNodeList.map((nodeTemplate, index) => {
          const card =
            nodeTemplate === LOAD_MORE_PLACEHOLDER ? (
              <LoadMoreCard onLoadMore={onLoadMore} />
            ) : (
              <PluginNode
                key={nodeTemplate.plugin_id}
                nodeTemplate={nodeTemplate}
                enableDrag={enableDrag}
                onSelect={({ event, nodeTemplate: pluginTool }) =>
                  handleSelectTool(event, pluginTool)
                }
                expand={expandPluginIndex === index}
                onExpandChange={expand => {
                  expand
                    ? setExpandPluginIndex(index)
                    : setExpandPluginIndex(undefined);
                }}
                keyword={keyword}
                index={index}
              />
            );
          return (
            <>
              {card}
              {pluginToolsDisplayIndex === index && pluginTools?.length ? (
                <div className={styles['plugin-tool-list']}>
                  {pluginTools.map((pluginTool, toolIndex) => (
                    <CustomDragCard
                      key={pluginTool?.api_id}
                      tooltipPosition={toolIndex % 2 === 0 ? 'left' : 'right'}
                      nodeType={pluginTool?.type as StandardNodeType}
                      nodeDesc={pluginTool.desc}
                      nodeJson={pluginTool.nodeJSON}
                      nodeTemplate={pluginTool}
                      disabled={!enableDrag}
                    >
                      <PluginToolCard
                        name={pluginTool.name ?? ''}
                        keyword={keyword}
                        onClick={event => handleSelectTool(event, pluginTool)}
                      />
                    </CustomDragCard>
                  ))}
                </div>
              ) : null}
            </>
          );
        })}
      </div>
    </div>
  );
};
