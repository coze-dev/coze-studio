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

import classNames from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { type CustomComponent } from '@coze-common/chat-area';

import { InterruptMessageContent } from './interrupt-message-content';

import styles from './index.module.less';

export const InterruptMessageBox: CustomComponent['MessageBox'] = props => {
  // Copywriting after user operation, front-end maintenance temporary state, refresh and disappear
  const [actionText, setActionText] = useState('');

  const { message, meta } = props;

  // Do not show logic: chat history, no action and not in the last group
  if (message._fromHistory || (!actionText && !meta.isFromLatestGroup)) {
    return null;
  }

  return (
    <div className={classNames(styles['interrupt-message-box'])}>
      <UIKitMessageBox
        {...props}
        messageId={message.message_id}
        senderInfo={{ id: '' }}
        showUserInfo={false}
        theme={actionText ? 'none' : 'border'}
      >
        <InterruptMessageContent
          interruptMessage={message}
          actionText={actionText}
          setActionText={setActionText}
        />
      </UIKitMessageBox>
    </div>
  );
};

InterruptMessageBox.displayName = 'ChatAreaFunctionCallMessageBox';
