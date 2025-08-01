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

import { useDrag } from 'react-dnd';
import React, { type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { concatTestId, type StandardNodeType } from '@coze-workflow/base';
import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';
import { useEntity, useService } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import {
  isPluginCategoryNodeTemplate,
  isPluginApiNodeTemplate,
  isSubWorkflowNodeTemplate,
} from '@/utils';
import {
  WorkflowGlobalStateEntity,
  type UnionNodeTemplate,
  type DragObject,
} from '@/typing';
import { WorkflowCustomDragService } from '@/services';
import { DND_ACCEPT_KEY } from '@/constants';

import styles from './styles.module.less';

export interface ICustomDragCardProps {
  className?: string;
  style?: React.CSSProperties;
  nodeType: StandardNodeType;
  nodeJson?: Partial<WorkflowNodeJSON>;
  disabled: boolean;
  children: React.ReactNode;
  nodeDesc?: string;
  tooltipPosition?: TooltipProps['position'];
  nodeTemplate?: UnionNodeTemplate;
  [k: string]: unknown;
}

export function CustomDragCard({
  className,
  style,
  children,
  nodeType,
  nodeJson,
  disabled,
  nodeDesc,
  tooltipPosition,
  nodeTemplate,
  ...rest
}: PropsWithChildren<ICustomDragCardProps>) {
  const workflowState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );

  const dragService = useService<WorkflowCustomDragService>(
    WorkflowCustomDragService,
  );

  const testId = concatTestId('workflow.detail.node-panel.card', nodeType);

  const [{ isDragging }, drag, preview] = useDrag<
    DragObject,
    unknown,
    { isDragging: boolean }
  >(() => ({
    type: DND_ACCEPT_KEY,
    item: {
      nodeType,
      nodeJson,
      modalProps: isPluginCategoryNodeTemplate(nodeTemplate)
        ? {
            initQuery: {
              type: nodeTemplate.categoryInfo.categoryId,
              isOfficial: nodeTemplate.categoryInfo.onlyOfficial
                ? true
                : undefined,
            },
          }
        : undefined,
      nodeVersionInfo: isPluginApiNodeTemplate(nodeTemplate)
        ? { pluginId: nodeTemplate.plugin_id, version: nodeTemplate.version }
        : isSubWorkflowNodeTemplate(nodeTemplate)
        ? // The version information of the workflow is obtained through the interface when dropping
          {
            workflowId: nodeTemplate.workflow_id,
            pluginId: nodeTemplate.plugin_id,
          }
        : {},
    },
    collect: monitor => {
      const dragType = monitor.getItemType();
      const item = monitor.getItem();
      if (item && dragType === DND_ACCEPT_KEY) {
        dragService.startDrag({
          type: item.nodeType,
          json: item.nodeJson,
        });
      } else {
        dragService.endDrag();
      }
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));

  const computedClassNames = classNames({
    [styles.card]: true,
    [styles['not-allowed']]: workflowState.isExecuting,
    [styles.grabbing]: isDragging,
    [className || '']: Boolean(className),
  });

  const baseContent = (
    <div
      className={styles.cardMargin}
      style={{ position: 'relative' }}
      data-testid={testId}
      data-node-type={nodeType}
    >
      {/* The copy of the node during the drag process is overwritten by the node below, so no hover or the like is triggered */}
      <div
        ref={preview}
        className={classNames(computedClassNames, styles['preview-card'])}
        style={style}
        {...rest}
      >
        {children}
      </div>
      {/* Draggable nodes, overlaid on node replicas */}
      {
        <div
          ref={!disabled ? drag : null}
          className={classNames(computedClassNames, styles['drag-card'])}
          {...rest}
        >
          {children}
        </div>
      }
    </div>
  );
  if (nodeDesc && !isDragging) {
    return (
      <Tooltip
        content={nodeDesc}
        position={tooltipPosition}
        mouseEnterDelay={500}
      >
        {baseContent}
      </Tooltip>
    );
  } else {
    return baseContent;
  }
}
