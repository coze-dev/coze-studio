import React, { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';

import { useNeedBot } from '@/components/test-run/hooks/use-need-bot';
import { useGetStartNode } from '@/components/test-run/hooks/use-get-start-node';
import { TestFormType } from '@/components/test-run/constants';
import {
  BotProjectVariableSelect as BaseSelect,
  type BotProjectVariableSelectProps,
} from '@/components/bot-project-select/bot-project-variable-select';

export default function BotProjectVariableSelect(
  props: BotProjectVariableSelectProps,
) {
  const [options, setOptions] = useState({});
  const { queryNeedBot } = useNeedBot();
  const { getNode } = useGetStartNode();
  const startNode = getNode();
  const testFormType = TestFormType.Default;
  useEffect(() => {
    const initOptions = async () => {
      if (startNode) {
        const isNeedBotEnv = await queryNeedBot(testFormType, startNode);
        const { hasLTMNode, hasConversationNode } = isNeedBotEnv;

        // 会话类节点，子流程（Chatflow）不能选择 Bot，因为Bot不支持多会话
        // LTM 节点不能选择 Project，因为 Project 还没有 LTM 能力
        const needDisableBot = hasConversationNode;
        const botDisableOptions = {
          disableBot: needDisableBot,
          disableBotTooltip: needDisableBot ? I18n.t('wf_chatflow_141') : '',
          disableProject: hasLTMNode,
          disableProjectTooltip: hasLTMNode ? I18n.t('wf_chatflow_142') : '',
        };
        setOptions(botDisableOptions);
      }
    };
    initOptions();
  }, []);

  return <BaseSelect {...props} {...options} />;
}
