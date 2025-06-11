import React from 'react';

import cls from 'classnames';
import { Typography } from '@coze/coze-design';

import { type ReceivedMessage } from '../../types';
import { MessageType } from '../../constants';

import styles from './text-message.module.less';

interface TextMessageProps {
  message: ReceivedMessage;
}

export const TextMessage: React.FC<TextMessageProps> = ({ message }) => {
  const { type, content } = message;

  return (
    <div
      className={cls(styles['text-message'], {
        [styles['user-msg']]: type === MessageType.Answer,
      })}
    >
      <Typography.Text>{content}</Typography.Text>
    </div>
  );
};
