import { useCallback, useState } from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozComment } from '@coze/coze-design/icons';
import { Tooltip, IconButton } from '@coze/coze-design';
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
      // 创建节点
      const node = await document.createWorkflowNodeByType(
        StandardNodeType.Comment,
        canvasPosition,
        {},
        containerNode?.id,
      );
      // 等待节点渲染
      setTimeout(() => {
        if (containerNode) {
          return;
        }
        // 选中节点
        selectService.selectNode(node);
        // 开始拖拽
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
