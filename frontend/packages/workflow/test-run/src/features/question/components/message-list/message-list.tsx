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

import { useEffect, useRef } from 'react';

import { useQuestionFormStore } from '../../hooks';
import { ContentType, MessageType } from '../../constants';
import { MessageItem } from './message-item';

import styles from './message-list.module.less';

export const MessageList = () => {
  const { messages, waiting } = useQuestionFormStore(store => ({
    messages: store.messages,
    waiting: store.waiting,
  }));

  const ref = useRef<HTMLDivElement>(null);

  // Automatically scroll to the last message
  useEffect(() => {
    const lastChild = ref.current?.lastElementChild;
    lastChild?.scrollIntoView();
  }, [messages.length, ref]);

  return (
    <div ref={ref} className={styles['message-list']}>
      {messages.map(item => (
        <MessageItem key={item.id} message={item} />
      ))}

      {/* loading */}
      {waiting ? (
        <MessageItem
          loading
          message={{
            type: MessageType.Question,
            content_type: ContentType.Text,
            content: '',
            id: '',
          }}
        />
      ) : null}
      <div className={styles['bottom-cover']} />
    </div>
  );
};
