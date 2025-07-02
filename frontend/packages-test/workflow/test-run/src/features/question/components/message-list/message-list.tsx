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

  // 自动滚动到最后一条消息
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
