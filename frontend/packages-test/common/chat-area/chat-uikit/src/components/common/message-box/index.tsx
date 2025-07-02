import { type FC } from 'react';

import { Layout } from '@coze-common/chat-uikit-shared';

import { ContentBox } from '../content-box';
import {
  type MessageBoxProps,
  type MessageBoxShellProps,
  type NormalMessageBoxProps,
} from './type';
import { MessageBoxWrap } from './message-box-wrap';

export const MessageBox: FC<
  MessageBoxShellProps | NormalMessageBoxProps
> = props => {
  const {
    theme = 'none',
    renderFooter,
    hoverContent,
    senderInfo,
    showUserInfo,
    right,
    classname,

    messageBubbleClassname,
    messageBubbleWrapperClassname,
    messageBoxWraperClassname,
    messageErrorWrapperClassname,
    isHoverShowUserInfo,

    layout = Layout.PC,
    showBackground = false,
    topRightSlot,
    imageAutoSizeContainerWidth,
    enableImageAutoSize,
    messageId,
    eventCallbacks,
    onError,
  } = props ?? {};
  const { url, nickname, id, userLabel, userUniqueName } = senderInfo ?? {};

  return (
    <MessageBoxWrap
      messageId={messageId}
      theme={theme}
      avatar={url}
      nickname={nickname}
      showUserInfo={showUserInfo}
      renderFooter={renderFooter}
      hoverContent={hoverContent}
      right={right}
      senderId={id || ''}
      classname={classname}
      messageBubbleWrapperClassname={messageBubbleWrapperClassname}
      messageBubbleClassname={messageBubbleClassname}
      messageBoxWraperClassname={messageBoxWraperClassname}
      messageErrorWrapperClassname={messageErrorWrapperClassname}
      isHoverShowUserInfo={isHoverShowUserInfo}
      layout={layout}
      contentTime={getMessageContentTime(props)}
      showBackground={showBackground}
      extendedUserInfo={{
        userLabel,
        userUniqueName,
      }}
      topRightSlot={topRightSlot}
      imageAutoSizeContainerWidth={imageAutoSizeContainerWidth}
      enableImageAutoSize={enableImageAutoSize}
      eventCallbacks={eventCallbacks}
      onError={onError}
    >
      {getMessageBoxContent(props)}
    </MessageBoxWrap>
  );
};

const getMessageContentTime = (props: MessageBoxProps): number | undefined => {
  if ('message' in props) {
    return Number(props.message.content_time);
  }
};

const getMessageBoxContent = (props: MessageBoxProps) => {
  if ('children' in props) {
    return props.children;
  }

  const {
    message,
    contentConfigs,
    eventCallbacks,
    getBotInfo,
    layout = Layout.PC,
    showBackground = false,
    isContentLoading,
    isCardDisabled,
  } = props;

  return (
    <ContentBox
      message={message}
      contentConfigs={contentConfigs}
      eventCallbacks={eventCallbacks}
      getBotInfo={getBotInfo}
      layout={layout}
      showBackground={showBackground}
      isContentLoading={isContentLoading}
      isCardDisabled={isCardDisabled}
    />
  );
};

MessageBox.displayName = 'UIKitMessageBox';
