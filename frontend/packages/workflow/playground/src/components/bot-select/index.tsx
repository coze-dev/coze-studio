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
import { I18n } from '@coze-arch/i18n';
import { withField } from '@coze-arch/bot-semi';

import { Variables } from './variables';
import { useVariables } from './use-variables';
import { useTableInfo } from './use-table-info';
import { useLTMInfo } from './use-ltm-info';
import { useChatHistory } from './use-chat-history';
import { TableInfo } from './table-info';
import { Item } from './item';
import { ChatHistory } from './chat-history';
import { Bots } from './bots';

import styles from './index.module.less';
interface BotSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  hideLabel?: boolean;
  hideVariblesForce?: boolean;
  hasVariableNode?: boolean;
  hasVariableAssignNode?: boolean;
  /** @Deprecated This field is currently useless, it can be cleaned up later. */
  hasDatabaseNode?: boolean;
  hasLTMNode?: boolean;
  hasChatHistoryEnabledLLM?: boolean;
}

export const BotSelect: React.FC<BotSelectProps> = ({
  value,
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
  const { tableInfo, isLoading: isTableInfoLoading } = useTableInfo(value);
  const { variables, isLoading: isVariablesLoading } = useVariables(value);
  const { chatHistory } = useChatHistory(value);
  const { ltmEnabled, isLoading: isLTMInfoLoading } = useLTMInfo(value);

  const botSelected = !!value;

  const hasVariables = variables && variables.length > 0;
  const hasTableInfo = tableInfo && tableInfo.length > 0;
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

  useMount(() => {
    const sourceBotId = new URLSearchParams(window.location.search).get(
      'bot_id',
    );
    if (!value && sourceBotId) {
      onChange?.(sourceBotId);
    }
  });

  return (
    <>
      <Item hideLabel={hideLabel} label={I18n.t('workflow_240218_02')}>
        <Bots value={value} onChange={onChange} {...props} />
      </Item>

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
            <div>
              {I18n.t('timecapsule_1228_001')}:{' '}
              {ltmEnabled
                ? I18n.t('timecapsule_0124_001')
                : I18n.t('timecapsule_0124_002')}
            </div>
          </Item>
        ) : null}
      </div>
    </>
  );
};

export const BotSelectWithField = withField(BotSelect, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});

BotSelectWithField.defaultProps = {
  fieldStyle: { overflow: 'visible' },
};
