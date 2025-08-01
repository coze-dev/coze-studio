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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozSendFill } from '@coze-arch/coze-design/icons';
import { Input, IconButton } from '@coze-arch/coze-design';

import { useSendMessage } from '../../hooks';

import styles from './answer-input.module.less';

export const AnswerInput = () => {
  const { send, waiting } = useSendMessage();

  const [value, setValue] = useState('');

  const disabled = value === '' || waiting;

  const handleSend = () => {
    if (disabled) {
      return;
    }
    send(value);

    setValue('');
  };

  return (
    <div className={styles['answer-input']}>
      <Input
        placeholder={I18n.t(
          'workflow_ques_ans_testrun_message_placeholder',
          {},
          'Send a message',
        )}
        value={value}
        onChange={val => setValue(val)}
        onEnterPress={handleSend}
        autoFocus
        size="large"
        suffix={
          <IconButton
            icon={<IconCozSendFill />}
            disabled={disabled}
            onClick={handleSend}
            color="secondary"
          />
        }
      />
    </div>
  );
};
