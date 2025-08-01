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

import { useMemo, type FC } from 'react';

import { useNodeRender } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { useNodeTestId } from '@coze-workflow/base';
import { IconInfo } from '@coze-arch/bot-icons';

import AutoSizeTooltip from '@/ui-components/auto-size-tooltip';
import { getBgColor } from '@/form-extensions/components/node-header/utils/get-bg-color';

import { useParentNode, useSubCanvasRenderProps } from '../../hooks';
import { NodeIcon } from '../../../node-icon';

import styles from './index.module.less';

export const SubCanvasHeader: FC = () => {
  const { startDrag, onFocus, onBlur } = useNodeRender();
  const { getNodeTestId, concatTestId } = useNodeTestId();

  const { title, tooltip } = useSubCanvasRenderProps();

  const parentNode = useParentNode();

  const bgColor = useMemo(() => {
    const parentNodeDataEntity =
      parentNode.getData<WorkflowNodeData>(WorkflowNodeData);
    const parentNodeData = parentNodeDataEntity.getNodeData();
    if (parentNodeData?.mainColor) {
      const OPACITY = 0.08;
      return `linear-gradient(${getBgColor(
        parentNodeData.mainColor,
        OPACITY,
      )} 0%, var(--coz-bg-plus) 100%)`;
    } else {
      return 'var(--coz-bg-plus)';
    }
  }, [parentNode]);

  return (
    <div
      className={styles['sub-canvas-header']}
      draggable={true}
      onMouseDown={e => {
        startDrag(e);
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        background: bgColor,
      }}
    >
      <NodeIcon
        className={styles['sub-canvas-logo']}
        nodeId={parentNode.id}
        size={24}
        alt="logo"
      />
      <p
        className={styles['sub-canvas-title']}
        data-testid={concatTestId(getNodeTestId(), 'title')}
      >
        {title}
      </p>
      {tooltip ? (
        <AutoSizeTooltip
          showArrow
          position="top"
          content={<span>{tooltip}</span>}
          className={styles['sub-canvas-tooltip']}
        >
          <IconInfo
            className={styles['sub-canvas-tooltip-icon']}
            data-testid={concatTestId(getNodeTestId(), 'tips')}
          />
        </AutoSizeTooltip>
      ) : null}
    </div>
  );
};
