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

import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Switch, Tooltip } from '@coze-arch/coze-design';

import { INPUT_CHAT_HISTORY_SETTING_ENABLE } from '@/node-registries/intent/constants';
import {
  OutputTree,
  type OutputTreeProps,
} from '@/form-extensions/components/output-tree';
import { withField, useField, useWatch } from '@/form';
import { ChatHistoryRound } from '@/components/chat-history-round';

import styles from './index.module.less';

export interface SwitchFieldProps {
  testId?: string;
}

export const ChatHistoryEnableSwitch = withField<SwitchFieldProps, boolean>(
  ({ testId }) => {
    const { value, onChange, readonly } = useField<boolean>();
    return (
      <Tooltip content={I18n.t('wf_chatflow_125')} position="right">
        <div className="flex items-center gap-1">
          <div className={styles['chat-history-text']}>
            {I18n.t('wf_chatflow_124')}
          </div>

          <Switch
            data-testid={testId}
            disabled={readonly}
            size="mini"
            checked={value}
            onChange={onChange}
          />
        </div>
      </Tooltip>
    );
  },
);

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

export const ChatHistoryPanel = withField(() => {
  const enableChatHistory = useWatch({
    name: INPUT_CHAT_HISTORY_SETTING_ENABLE,
  });
  const { value, onChange, readonly } = useField<number>();

  return enableChatHistory ? (
    <div className="relative">
      <OutputTree
        id="chat-history"
        readonly
        value={VALUE}
        defaultCollapse
        onChange={() => {
          console.log('OutputTree change');
        }}
        withDescription={false}
        withRequired={false}
        noCard
      />
      <div className={styles.line} />

      <ChatHistoryRound
        value={value}
        readonly={readonly}
        onChange={w => {
          onChange(Number(w));
        }}
      />
    </div>
  ) : null;
});
