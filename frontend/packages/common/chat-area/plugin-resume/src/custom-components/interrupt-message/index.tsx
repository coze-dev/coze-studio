import { useState } from 'react';

import classNames from 'classnames';
import { MessageBox as UIKitMessageBox } from '@coze-common/chat-uikit';
import { type CustomComponent } from '@coze-common/chat-area';

import { InterruptMessageContent } from './interrupt-message-content';

import styles from './index.module.less';

export const InterruptMessageBox: CustomComponent['MessageBox'] = props => {
  // 用户操作后文案，前端维护暂时状态，刷新消失
  const [actionText, setActionText] = useState('');

  const { message, meta } = props;

  // 不展示逻辑： 为历史消息、无action且不在最后一个group
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
