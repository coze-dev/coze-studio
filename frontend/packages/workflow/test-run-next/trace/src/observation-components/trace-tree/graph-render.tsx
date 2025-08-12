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

import { clsx } from 'clsx';
import {
  IconCozClockFill,
  IconCozArrowLeftFill,
} from '@coze-arch/coze-design/icons';
import { Tag, Tooltip, IconButton } from '@coze-arch/coze-design';

import { formatDuration } from '../utils/time';
import { isSuccessStatus } from '../utils/basic';
import {
  type SpanNode,
  type NodeConfig,
  type NodePresetConfig,
  type SpanNodeRenderOptions,
  type RenderGraphNodeConfig,
} from '../typings/graph';
import { NODE_PRESET_CONFIG_MAP, type PresetSpanType } from '../consts/graph';
import { type TreeNodeExtra } from '../common/tree';
import { ReactComponent as IconBroken } from '../assets/graph/icon-broken.svg';
import { useTraceTree } from './context';

import styles from './index.module.less';

export function getNodeConfig(
  params: Pick<SpanNode, 'name' | 'type'> & {
    customTypeConfigMap?: Record<string | number, NodePresetConfig | undefined>;
  },
): NodeConfig {
  const { name, type, customTypeConfigMap } = params;
  const nodeConfig: NodeConfig = {
    character: name?.charAt(0),
    color: '#b4baf6',
  };

  if (!type) {
    return nodeConfig;
  } else {
    const presetNodeConfig =
      customTypeConfigMap?.[type] ??
      NODE_PRESET_CONFIG_MAP[type as PresetSpanType];

    return {
      ...nodeConfig,
      ...presetNodeConfig,
    };
  }
}
interface CustomTreeNodeProps {
  renderGraphNodeConfig?: RenderGraphNodeConfig;
  nodeData: TreeNodeExtra;
}

export const CustomTreeNode = ({
  renderGraphNodeConfig,
  nodeData,
}: CustomTreeNodeProps) => {
  const { treeMap, onCollapse } = useTraceTree();

  const { selected, hover, key } = nodeData;
  const { spanNode } = nodeData?.extra as { spanNode: SpanNode };
  const { type, name, status_code, isBroken, span_id, duration } = spanNode;
  const { isCollapsed } = treeMap[key] || {};

  const isLeaf = !spanNode.children || spanNode.children.length === 0;

  const { customTypeConfigMap, traceTreeCustomRenderer } =
    renderGraphNodeConfig || {};

  const { icon, character, color } = getNodeConfig({
    type,
    name,
    customTypeConfigMap,
  });

  const customTreeNodeContent = useMemo(
    () => (
      <div
        className={clsx(styles['tree-custom-node-content'], {
          [styles.selected]: selected,
          [styles.hover]: hover,
          [styles.error]: !isSuccessStatus(status_code),
        })}
      >
        <span className={styles.title}>{name}</span>
      </div>
    ),
    [selected, hover, status_code, name],
  );

  return (
    <div className={styles['tree-custom-node']}>
      <div className={styles['tree-custom-node-icon']}>
        {isBroken ? <IconBroken /> : null}
        {icon ?? (
          <span
            className={styles['tree-custom-node-icon-default']}
            style={{
              backgroundColor: color,
            }}
          >
            {character}
          </span>
        )}
      </div>
      {traceTreeCustomRenderer?.renderTooltip ? (
        <Tooltip
          position="right"
          {...traceTreeCustomRenderer.renderTooltip?.(spanNode)}
        >
          {customTreeNodeContent}
        </Tooltip>
      ) : (
        customTreeNodeContent
      )}
      <Tag
        color={
          Number(duration) > 60000
            ? 'red'
            : Number(duration) > 10000
            ? 'yellow'
            : 'green'
        }
        type="light"
        className={styles['node-tag']}
        size="mini"
        prefixIcon={<IconCozClockFill />}
      >
        {formatDuration(Number(duration))}
      </Tag>
      {traceTreeCustomRenderer?.renderExtra?.(spanNode)}
      {!isLeaf && (
        <Tooltip content={isCollapsed ? '展开' : '收起'} position="right">
          <IconButton
            color="secondary"
            size="mini"
            icon={
              <IconCozArrowLeftFill
                className={clsx(!isCollapsed && styles['is-open'])}
              />
            }
            onClick={e => {
              e.stopPropagation();
              onCollapse?.(span_id || '', !isCollapsed);
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export const renderCustomTreeNode =
  ({ renderGraphNodeConfig }: SpanNodeRenderOptions) =>
  (nodeData: TreeNodeExtra) =>
    (
      <CustomTreeNode
        nodeData={nodeData}
        renderGraphNodeConfig={renderGraphNodeConfig}
      />
    );
