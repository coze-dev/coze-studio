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
