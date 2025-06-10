import { type ModeOption } from '@coze-agent-ide/space-bot/component';
import { I18n } from '@coze-arch/i18n';
import { IconCozWorkflow } from '@coze/coze-design/icons';
import { IconSingleMode } from '@coze-arch/bot-icons';
import { BotMode } from '@coze-arch/bot-api/developer_api';

export const modeOptionList: ModeOption[] = [
  {
    value: BotMode.SingleMode,
    getIsDisabled: () => false,
    icon: <IconSingleMode />,
    title: I18n.t('singleagent_LLM_mode'),
    desc: I18n.t('singleagent_LLM_mode_desc'),
    showText: true,
  },
  {
    value: BotMode.WorkflowMode,
    getIsDisabled: () => false,
    icon: <IconCozWorkflow />,
    title: I18n.t('singleagent_workflow_mode'),
    desc: I18n.t('singleagent_workflow_mode_desc'),
    showText: true,
  },
];
