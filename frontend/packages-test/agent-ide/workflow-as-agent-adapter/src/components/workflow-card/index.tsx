import { type FC } from 'react';

import { ToolItemActionCopy } from '@coze-agent-ide/tool';
import { type WorkFlowItemType } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { WorkFlowItemCozeDesign } from '@coze-agent-ide/workflow-item';

export interface WorkflowCardProps {
  botId: string;
  workflow: WorkFlowItemType;
  onRemove: () => void;
  isReadonly: boolean;
}

export const WorkflowCard: FC<WorkflowCardProps> = ({
  workflow,
  onRemove,
  isReadonly,
}) => (
  <WorkFlowItemCozeDesign
    list={[workflow]}
    removeWorkFlow={onRemove}
    isReadonly={isReadonly}
    renderActionSlot={({ handleCopy, name }) => (
      <ToolItemActionCopy
        tooltips={I18n.t('Copy')}
        onClick={() => handleCopy(name ?? '')}
        data-testid={'bot.editor.tool.workflow.copy-button'}
      />
    )}
    size="large"
  />
);
