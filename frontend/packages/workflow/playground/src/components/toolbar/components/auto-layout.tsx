import { useCallback } from 'react';

import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozAutoLayout } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';
import { useEntity, usePlayground } from '@flowgram-adapter/free-layout-editor';

import { useAutoLayout } from '../hooks';
import { WorkflowGlobalStateEntity } from '../../../entities';

export const AutoLayout = () => {
  const runAutoLayout = useAutoLayout();
  const playground = usePlayground();
  const workflowState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );
  const { workflowId } = workflowState;
  const autoLayout = useCallback(async () => {
    await runAutoLayout();
    reporter.event({
      eventName: 'workflow_control_auto_layout',
      namespace: 'workflow',
      scope: 'control', // 二级命名空间，细化具体场景
      meta: {
        workflowId,
      }, // 其他自定义信息，应尽量避免上报无关信息或冗余信息
    });
  }, [runAutoLayout, workflowId]);

  if (playground.config.readonly) {
    return <></>;
  }

  return (
    <Tooltip content={I18n.t('workflow_detail_layout_optimization_tooltip')}>
      <IconButton
        onClick={autoLayout}
        icon={<IconCozAutoLayout className="coz-fg-primary" />}
        color="secondary"
        data-testid="workflow.detail.toolbar.auto-layout"
      />
    </Tooltip>
  );
};
