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

import { useCallback, useEffect, useState, useContext } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { ConfigProvider, Typography } from '@coze-arch/coze-design';
import {
  type FlowNodeEntity,
  useConfigEntity,
  useService,
} from '@flowgram-adapter/fixed-layout-editor';

import { Collapse } from '../collapse';
import { getNodeExtInfo, getTreeIdFromNodeId } from '../../utils';
import { type NodeType, type CustomLine } from '../../typings';
import { CustomHoverService, TreeService } from '../../services';
import { useCustomNodeRender } from '../../hooks';
import { CustomRenderStateConfigEntity } from '../../entities';
import { TreeContext } from '../../contexts';
import { NODE_WIDTH, COLLAPSE_WIDTH, NODE_HEIGHT } from '../../constants';
import { Tags } from './tags';
import { Icon } from './icon';
import { colorMap } from './constants';

import s from './index.module.less';

const { Text } = Typography;

export const BaseNode = ({ node }: { node: FlowNodeEntity }) => {
  const nodeRender = useCustomNodeRender();
  const treeService = useService<TreeService>(TreeService);
  // Schema Information Store
  const extraInfo = nodeRender.getExtInfo();
  const [hoverNode, setHoverNode] = useState(false);
  const { renderLinkNode } = useContext(TreeContext);

  const { edges } = treeService;

  const getPopupContainer = useCallback(
    () => node.renderData.node || document.body,
    [],
  );
  const [collapseVisible, setCollapseVisible] = useState(false);
  const nodeState = useConfigEntity<CustomRenderStateConfigEntity>(
    CustomRenderStateConfigEntity,
    true,
  );

  const nodeId = getTreeIdFromNodeId(node.id);
  const highlight = nodeState.selectNodes.includes(nodeId);
  const activatedResId: string = nodeState.activatedNode
    ? getNodeExtInfo(nodeState.activatedNode).id
    : '';
  const activatedVersion = nodeState.activatedNode
    ? getNodeExtInfo(nodeState.activatedNode).version
    : '';
  const isOtherVersion = activatedResId === extraInfo.id;
  const activated = nodeState.activatedNode?.id === node.id;

  const hoverService = useService<CustomHoverService>(CustomHoverService);

  useEffect(() => {
    const disposable = hoverService.onHoverLine((line?: CustomLine) => {
      if (line?.from?.id && node?.id?.includes(line?.from?.id)) {
        setCollapseVisible(true);
      } else {
        setCollapseVisible(false);
      }
    });
    return () => disposable?.dispose();
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    // 1. Uncheck other selected lines
    hoverService.backgroundClick();
    // 2. Select the node and recalculate the lines that need to be selected.
    hoverService.selectNode(node);
    e.stopPropagation();
  };

  const handleMouseEnter = () => {
    setHoverNode(true);
    // Determine the node type
    if (
      node.flowNodeType !== 'custom' ||
      edges.some(edge => edge.from === node.id)
    ) {
      setCollapseVisible(true);
    }
  };
  const handleMouseLeave = () => {
    setHoverNode(false);
    setCollapseVisible(false);
  };

  const collapsed =
    (node.flowNodeType === 'blockIcon' &&
      !node?.children?.length &&
      !node.next) ||
    edges.find(e => e.from === node.id)?.collapsed;

  const { loop } = extraInfo;

  return (
    <ConfigProvider getPopupContainer={getPopupContainer}>
      <div
        className={classNames(s.nodeContainer, {
          [s.activated]: activated || isOtherVersion,
          [s.highlight]: isOtherVersion || highlight,
        })}
        style={{
          background: colorMap[extraInfo.type as NodeType],
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className={s.header}>
          <div className={s['icon-container']}>
            <Icon type={extraInfo.type} icon={extraInfo.icon} />
          </div>
          <Text
            className={s.title}
            ellipsis={{
              showTooltip: {
                type: 'tooltip',
                opts: {
                  theme: 'dark',
                },
              },
            }}
          >
            {extraInfo.name}
          </Text>
          {hoverNode ? renderLinkNode?.(extraInfo) || null : null}
        </div>
        <Tags
          type={extraInfo.type}
          from={extraInfo.from}
          loop={loop}
          version={extraInfo.version}
        />
        {collapseVisible || collapsed ? (
          <div
            style={{
              position: 'absolute',
              left: NODE_WIDTH / 2 - COLLAPSE_WIDTH / 2,
              top: NODE_HEIGHT + 2,
              rotate: '90deg',
            }}
          >
            <Collapse
              node={node}
              collapseNode={node}
              collapsed={collapsed}
              hoverActivated={hoverNode}
            />
          </div>
        ) : null}
        {/* Different versions of tags */}
        {isOtherVersion && !activated ? (
          <div className={s['diff-tag']}>
            {activatedVersion === extraInfo.version
              ? I18n.t('reference_graph_tag_different_version_same_resource')
              : I18n.t(
                  'reference_graph_tag_different_version_of_same_resource',
                )}
          </div>
        ) : null}
      </div>
    </ConfigProvider>
  );
};
