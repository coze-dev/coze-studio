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

/* eslint-disable complexity */
import React from 'react';

import { useMount } from 'ahooks';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { withField } from '@coze-arch/bot-semi';

import { Variables } from './variables';
import { useVariables } from './use-variables';
import { useTableInfo } from './use-table-info';
import { useProjectVariables } from './use-project-variables';
import { useLTMInfo } from './use-ltm-info';
import { useChatHistory } from './use-chat-history';
import { type ValueType } from './types';
import { TableInfo } from './table-info';
import { Item } from './item';
import { ChatHistory } from './chat-history';
import { Bots } from './bots';

import styles from './index.module.less';

interface BotSelectProps {
  value?: ValueType;
  onChange?: (value?: ValueType) => void;
  hideLabel?: boolean;
  hideVariblesForce?: boolean;
  hasVariableNode?: boolean;
  hasVariableAssignNode?: boolean;
  hasDatabaseNode?: boolean;
  hasLTMNode?: boolean;
  hasChatHistoryEnabledLLM?: boolean;

  disableBot?: boolean;
  disableBotTooltip?: string;
  disableProject?: boolean;
  disableProjectTooltip?: string;
}

/**
 * copy from bot-select
 */
export const BotProjectSelect: React.FC<BotSelectProps> = ({
  value: originValue,
  onChange,
  hideLabel = false,
  hideVariblesForce = false,
  hasVariableNode = false,
  hasVariableAssignNode = false,
  hasDatabaseNode = false,
  hasChatHistoryEnabledLLM = false,
  hasLTMNode = false,
  ...props
}) => {
  let value = originValue;
  // Compatible with historical data
  if (typeof originValue === 'string') {
    value = {
      id: originValue,
      type: IntelligenceType.Bot,
    };
  }
  const valueId = value?.id;
  const isBot = value?.type === IntelligenceType.Bot;
  const { tableInfo, isLoading: isTableInfoLoading } = useTableInfo(
    isBot ? valueId : undefined,
  );
  const { variables, isLoading: isVariablesLoading } = useVariables(
    isBot ? valueId : undefined,
  );
  const { variables: projectVariables, isLoading: isProjectVariablesLoading } =
    useProjectVariables(!isBot ? valueId : undefined);
  const {
    chatHistory,
    // conversationId,
    // sectionId,
  } = useChatHistory(isBot ? valueId : undefined);
  const { ltmEnabled, isLoading: isLTMInfoLoading } = useLTMInfo(
    isBot ? valueId : undefined,
  );

  const botSelected = !!valueId;

  const hasVariables = variables && variables.length > 0;
  const hasTableInfo = tableInfo && tableInfo.length > 0;
  const hasProjectVariables = projectVariables && projectVariables?.length > 0;
  const hasChatHistory = !!chatHistory;

  const showTableInfo = botSelected && !isTableInfoLoading && hasDatabaseNode;
  const showVariables =
    botSelected &&
    !isVariablesLoading &&
    (hasVariableNode || hasVariableAssignNode) &&
    !hideVariblesForce;

  // Practice running is a temporary session, here the bot chat history display may be misleading, first hide
  const showChatHistory = false;
  // const showChatHistory =
  //   botSelected && !isChatHistoryLoading && hasChatHistoryEnabledLLM;
  const showLTMInfo = botSelected && hasLTMNode && !isLTMInfoLoading;
  const showProjectVariables =
    botSelected &&
    (hasVariableNode || hasVariableAssignNode) &&
    !isProjectVariablesLoading &&
    !isBot;

  useMount(() => {
    const sourceBotId = new URLSearchParams(window.location.search).get(
      'bot_id',
    );
    if (!valueId && sourceBotId) {
      onChange?.({
        id: sourceBotId,
        type: IntelligenceType.Bot,
      });
    }
  });

  return (
    <>
      <Item hideLabel={hideLabel} label={I18n.t('workflow_240218_02')}>
        <Bots isBot={isBot} value={value} onChange={onChange} {...props} />
      </Item>

      {showProjectVariables ? (
        <div className={styles.container}>
          <Item
            label={I18n.t('wf_chatflow_126')}
            defaultText={I18n.t('wf_chatflow_127')}
          >
            {hasProjectVariables ? (
              <Variables variables={projectVariables} />
            ) : null}
          </Item>
        </div>
      ) : null}

      {isBot ? (
        <div
          className={styles.container}
          style={{
            display:
              showVariables || showTableInfo || showChatHistory || showLTMInfo
                ? 'block'
                : 'none',
          }}
        >
          {showVariables ? (
            <Item
              label={I18n.t('workflow_detail_testrun_variable_node_field')}
              defaultText={I18n.t(
                'workflow_detail_testrun_variable_node_nofield',
              )}
            >
              {hasVariables ? <Variables variables={variables} /> : null}
            </Item>
          ) : null}

          {showTableInfo ? (
            <Item
              label={I18n.t('workflow_240218_05')}
              defaultText={I18n.t('workflow_240218_04')}
            >
              {hasTableInfo ? <TableInfo data={tableInfo} /> : null}
            </Item>
          ) : null}

          {showChatHistory ? (
            <Item
              label={I18n.t('workflow_chathistory_testrun_title')}
              defaultText={I18n.t('workflow_chathistory_testrun_nocontent')}
            >
              {hasChatHistory ? <ChatHistory data={chatHistory} /> : null}
            </Item>
          ) : null}

          {showLTMInfo ? (
            <Item label={I18n.t('ltm_240617_02')}>
              <div className="text-[12px]">
                {I18n.t('timecapsule_1228_001')}:{' '}
                {ltmEnabled
                  ? I18n.t('timecapsule_0124_001')
                  : I18n.t('timecapsule_0124_002')}
              </div>
            </Item>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export const BotProjectSelectWithField = withField(BotProjectSelect, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});

BotProjectSelectWithField.defaultProps = {
  fieldStyle: { overflow: 'visible' },
};
