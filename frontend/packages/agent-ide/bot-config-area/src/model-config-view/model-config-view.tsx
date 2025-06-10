import { I18n } from '@coze-arch/i18n';
import { BotMode } from '@coze-arch/bot-api/playground_api';
import { useGetSingleAgentCurrentModel } from '@coze-agent-ide/model-manager';

import { SingleAgentModelView } from './single-agent-model-view';
import { DialogueConfigView } from './dialogue-config-view';

export const ModelConfigView: React.FC<{
  mode: BotMode;
  modelListExtraHeaderSlot?: React.ReactNode;
}> = ({ mode, modelListExtraHeaderSlot }) => {
  const currentModel = useGetSingleAgentCurrentModel();

  if (mode === BotMode.SingleMode) {
    return currentModel?.model_type ? (
      <SingleAgentModelView
        modelListExtraHeaderSlot={modelListExtraHeaderSlot}
      />
    ) : null;
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
