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

import { nanoid } from 'nanoid';
import { ViewVariableType, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, Switch } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ChatHistoryRound } from '@/components/chat-history-round';

import { OutputTree, type OutputTreeProps } from '../../components/output-tree';
import { FormCard } from '../../components/form-card';

import styles from './index.module.less';

const VALUE = [
  {
    key: nanoid(),
    name: 'chatHistory',
    type: ViewVariableType.ArrayObject,
    children: [
      {
        key: nanoid(),
        name: 'role',
        type: ViewVariableType.String,
      },
      {
        key: nanoid(),
        name: 'content',
        type: ViewVariableType.String,
      },
    ],
  },
] as OutputTreeProps['value'];

export interface ChatHistoryValue {
  enableChatHistory: boolean;
  chatHistoryRound: number;
}

export const ChatHistory: FC<SetterComponentProps<ChatHistoryValue>> = ({
  value,
  onChange,
  readonly,
  context,
}) => {
  const { getNodeSetterId } = useNodeTestId();

  return (
    <>
      <FormCard.Action>
        <Tooltip content={I18n.t('wf_chatflow_125')} position="right">
          <div className="flex items-center gap-1">
            <div className={styles['chat-history-text']}>
              {I18n.t('wf_chatflow_124')}
            </div>
            <Switch
              size="mini"
              checked={value?.enableChatHistory}
              data-testid={getNodeSetterId(context.meta.name)}
              onChange={checked => {
                if (value.enableChatHistory === checked) {
                  return;
                }

                onChange?.({
                  ...value,
                  enableChatHistory: checked,
                });
              }}
              disabled={readonly}
            />
          </div>
        </Tooltip>
      </FormCard.Action>
      {value?.enableChatHistory ? (
        <div className="relative">
          <OutputTree
            id="chat-history"
            readonly
            value={VALUE}
            defaultCollapse
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onChange={() => {}}
            withDescription={false}
            withRequired={false}
            noCard
          />
          <div className={styles.line} />

          <ChatHistoryRound
            value={value.chatHistoryRound}
            readonly={readonly}
            onChange={w => {
              onChange({
                ...value,
                chatHistoryRound: Number(w),
              });
            }}
          />
        </div>
      ) : null}
    </>
  );
};

export const chatHistory = {
  key: 'ChatHistory',
  component: ChatHistory,
};
