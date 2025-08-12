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

import { I18n } from '@coze-arch/i18n';
import { BotMode } from '@coze-arch/bot-api/playground_api';
import { useGetSingleAgentCurrentModel } from '@coze-agent-ide/model-manager';
import { DialogueConfigView } from '@coze-agent-ide/bot-config-area';

import { SingleAgentModelView } from './single-agent-model-view';

export const ModelConfigView: React.FC<{
  mode: BotMode;
  modelListExtraHeaderSlot?: React.ReactNode;
}> = ({ mode, modelListExtraHeaderSlot }) => {
  const currentModel = useGetSingleAgentCurrentModel();

  if (mode === BotMode.SingleMode) {
    // Always show the model selector even if current model doesn't exist
    // This allows users to select a valid model when the current one is invalid
    return (
      <SingleAgentModelView
        modelListExtraHeaderSlot={modelListExtraHeaderSlot}
      />
    );
  }
  if (mode === BotMode.MultiMode || mode === BotMode.WorkflowMode) {
    return (
      <DialogueConfigView
        tips={
          mode === BotMode.WorkflowMode
            ? I18n.t('workflow_agent_dialog_set_desc')
            : null
        }
      />
    );
  }
  return null;
};
