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
