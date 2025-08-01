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

import { useEffect, useState } from 'react';

import { I18n } from '@coze-arch/i18n';

import {
  BotProjectSelectTestset,
  type BotSelectProps,
} from '../test-form-materials/bot-project-select';
import { useNeedBot } from '../hooks/use-need-bot';
import { useGetStartNode } from '../hooks/use-get-start-node';
import { TestFormType } from '../constants';

export const TestsetBotProjectSelect = (props: BotSelectProps) => {
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

        // Session class nodes, subflows (Chatflow) cannot select Bot because Bot does not support multi-session
        // The LTM node cannot select Project because Project does not yet have LTM capabilities
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

  return <BotProjectSelectTestset {...props} {...options} />;
};
