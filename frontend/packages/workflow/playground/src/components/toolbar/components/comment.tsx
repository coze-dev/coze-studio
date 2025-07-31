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

import { useCallback, useState } from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozComment } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';
import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
  type WorkflowNodeMeta,
  WorkflowSelectService,
  usePlayground,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowCustomDragService } from '@/services';

export const Comment = () => {
  const playground = usePlayground();
  const document = useService(WorkflowDocument);
  const selectService = useService(WorkflowSelectService);
  const dragService = useService(WorkflowCustomDragService);

  const [tooltipVisible, setTooltipVisible] = useState(false);

  const calcNodePosition = useCallback(
    (
      mouseEvent: React.MouseEvent<HTMLButtonElement>,
      containerNode?: WorkflowNodeEntity,
    ) => {
      const mousePosition = playground.config.getPosFromMouseEvent(mouseEvent);
      if (!containerNode) {
        return {
          x: mousePosition.x,
          y: mousePosition.y - 75,
        };
      }
      const containerTransform = containerNode.getData(FlowNodeTransformData);
      const childrenLength = containerNode.collapsedChildren.length;
      return {
        x:
          containerTransform.padding.left -
          containerTransform.padding.left +
          childrenLength * 30,
        y: containerTransform.padding.top + childrenLength * 30,
      };
    },
    [playground],
  );

  const createComment = useCallback(
    async (mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
      setTooltipVisible(false);
      let containerNode: WorkflowNodeEntity | undefined;
      if (
        selectService.activatedNode?.getNodeMeta<WorkflowNodeMeta>().isContainer
      ) {
        containerNode = selectService.activatedNode;
      }
      const canvasPosition = calcNodePosition(mouseEvent, containerNode);
      // Create Node
      const node = await document.createWorkflowNodeByType(
        StandardNodeType.Comment,
        canvasPosition,
        {},
        containerNode?.id,
      );
      // Wait for node to render
      setTimeout(() => {
        if (containerNode) {
          return;
        }
        // selected node
        selectService.selectNode(node);
        // Start dragging
        dragService.startDragSelectedNodes(mouseEvent);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- waiting for node render
      }, 50);
    },
    [selectService, calcNodePosition, document, dragService],
  );

  if (playground.config.readonly) {
    return <></>;
  }

  return (
    <Tooltip
      trigger="custom"
      visible={tooltipVisible}
      onVisibleChange={setTooltipVisible}
      content={I18n.t('workflow_toolbar_comment_tooltips')}
    >
      <IconButton
        icon={<IconCozComment className="coz-fg-primary" />}
        color="secondary"
        data-testid="workflow.detail.controls.comment"
        onClick={createComment}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      />
    </Tooltip>
  );
};
