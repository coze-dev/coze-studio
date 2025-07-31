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

import { I18n } from '@coze-arch/i18n';
import { Avatar } from '@coze-arch/coze-design';

import { type ReceivedMessage } from '../../types';
import { ContentType, MessageType } from '../../constants';
import userAvatar from './user-avatar.png';
import { TextMessage } from './text-message';
import { OptionMessage } from './option-message';
import { MessageLoading } from './message-loading';
import botAvatar from './bot-avatar.png';

import styles from './message-item.module.less';

const BotAvatar = () => (
  <Avatar src={botAvatar} size="small" className={styles['message-avatar']} />
);
const UserAvatar = () => (
  <Avatar src={userAvatar} size="small" className={styles['message-avatar']} />
);

interface MessageItemProps {
  message: ReceivedMessage;
  loading?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  loading,
}) => {
  const { content_type: contentType, type } = message;

  return (
    <div className={styles['message-item']}>
      {type === MessageType.Question ? <BotAvatar /> : <UserAvatar />}

      <div className={styles['message-main']}>
        <div className={styles['user-name']}>
          {type === MessageType.Question
            ? I18n.t('workflow_ques_ans_testrun_botname', {}, 'Bot')
            : I18n.t('workflow_ques_ans_testrun_username', {}, 'User')}
        </div>
        {loading ? <MessageLoading /> : null}
        {!loading && contentType === ContentType.Option && (
          <OptionMessage message={message} />
        )}
        {!loading && contentType === ContentType.Text && (
          <TextMessage message={message} />
        )}
      </div>
    </div>
  );
};
