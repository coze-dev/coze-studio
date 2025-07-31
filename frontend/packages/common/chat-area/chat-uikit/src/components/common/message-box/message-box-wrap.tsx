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

import {
  type PropsWithChildren,
  type FC,
  useRef,
  useState,
  useEffect,
} from 'react';

import classnames from 'classnames';
import { useClickAway, useHover, useUpdateEffect } from 'ahooks';
import { ErrorBoundary } from '@coze-arch/logger';
import {
  Layout,
  UIKitEvents,
  useUiKitEventCenter,
} from '@coze-common/chat-uikit-shared';
import { useEventCallback } from '@coze-common/chat-hooks';
import { Avatar, Typography } from '@coze-arch/coze-design';

import { UserLabel, UserName } from '../user-label';
import { MessageContentTime } from '../message-content-time';
import { typeSafeMessageBoxInnerVariants } from '../../../variants/message-box-inner-variants';
import { useObserveCardContainer } from '../../../hooks/use-observe-card-container';
import { UIKitMessageBoxProvider } from '../../../context/message-box';
import { useUIKitCustomComponent } from '../../../context/custom-components';
import defaultAvatar from '../../../assets/default-avatar.png';
import {
  typeSafeBotNicknameVariants,
  messageBoxContainerVariants,
} from './variants';
import { getMessageBoxInnerVariantsByTheme } from './utils';
import { type MessageBoxWrapProps } from './type';
import { FallbackComponent } from './fallback';
import { DefaultAvatarWrap } from './default-avatar-wrap';
import './message-box.less';

export const MessageBoxWrap: FC<
  PropsWithChildren<MessageBoxWrapProps>
  // eslint-disable-next-line @coze-arch/max-line-per-function
> = props => {
  const {
    children,
    theme,
    nickname,
    avatar,
    showUserInfo,
    renderFooter,
    hoverContent,
    right,
    senderId,
    classname,
    messageBubbleClassname,
    messageBubbleWrapperClassname,
    messageBoxWraperClassname,
    messageErrorWrapperClassname,
    isHoverShowUserInfo = true,
    layout,
    contentTime,
    showBackground,
    extendedUserInfo,
    topRightSlot,
    imageAutoSizeContainerWidth,
    enableImageAutoSize,
    messageId,
    eventCallbacks,
    onError,
  } = props;
  const { userLabel, userUniqueName } = extendedUserInfo ?? {};
  const [botAvatar, setBotAvatar] = useState(avatar || defaultAvatar);
  const { MentionOperateTool = () => null, AvatarWrap = DefaultAvatarWrap } =
    useUIKitCustomComponent();
  const wrapRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messageFooterRef = useRef<HTMLDivElement>(null);
  const eventCenter = useUiKitEventCenter();
  const isMobileLayout = layout === Layout.MOBILE;
  const refreshContainerWidthConditionally = useEventCallback(() => {
    if (!messageContainerRef.current || !messageFooterRef.current) {
      return;
    }

    const currentMessageWidth = `${messageContainerRef.current.offsetWidth}px`;
    const currentFooterWidth = messageFooterRef.current.style.width;

    if (currentFooterWidth === currentMessageWidth) {
      return;
    }

    messageFooterRef.current.style.width = currentMessageWidth;
  });

  useUpdateEffect(() => {
    setBotAvatar(avatar || defaultAvatar);
  }, [avatar]);
  useObserveCardContainer({
    messageId,
    cardContainerRef: messageContainerRef,
    onResize: refreshContainerWidthConditionally,
  });

  useEffect(() => {
    if (!eventCenter) {
      return;
    }
    eventCenter.on(
      UIKitEvents.WINDOW_RESIZE,
      refreshContainerWidthConditionally,
    );

    return () => {
      eventCenter.off(
        UIKitEvents.WINDOW_RESIZE,
        refreshContainerWidthConditionally,
      );
    };
  }, []);

  const isHovering = useHover(() => wrapRef.current);

  // Adapt mobile end mobile end has no hover effect, use click interaction
  const [hoverContentVisible, setHoverContentVisible] =
    useState<boolean>(false);

  useClickAway(() => {
    setHoverContentVisible(false);
  }, wrapRef);

  return (
    <UIKitMessageBoxProvider
      value={{
        layout,
        imageAutoSizeContainerWidth,
        enableImageAutoSize,
        eventCallbacks,
        onError,
      }}
    >
      <div
        // chat-uikit-message-box
        className={classnames('max-w-full', classname)}
        ref={wrapRef}
        onClick={() => {
          if (isMobileLayout) {
            setHoverContentVisible(true);
          }
        }}
      >
        <div
          // chat-uikit-message-box-container chat-uikit-message-box-container-pc
          className={classnames(
            messageBoxContainerVariants({ isMobileLayout }),
            messageBoxWraperClassname,
          )}
        >
          <div
            // chat-uikit-message-box-container__avatar-wrap
            className="mr-[12px] w-32px h-32px"
          >
            {showUserInfo ? (
              <AvatarWrap>
                <Avatar
                  // chat-uikit-message-box-container__avatar-wrap__avatar
                  size="small"
                  src={botAvatar}
                  onError={() => setBotAvatar(defaultAvatar)}
                ></Avatar>
              </AvatarWrap>
            ) : null}
          </div>
          <div
            // chat-uikit-message-box-container__message
            className="flex-1 max-w-[calc(100%-44px)]"
          >
            {/* TODO: Rendering multiple content within a message is not supported */}
            <div
              // chat-uikit-message-box-container__message__message-box
              className="relative flex flex-col w-fit max-w-full"
            >
              {showUserInfo && nickname ? (
                <div
                  // chat-uikit-message-box-container__message__nickname
                  className="flex"
                >
                  <Typography.Text
                    ellipsis={{
                      showTooltip: {
                        opts: {
                          content: nickname,
                        },
                      },
                    }}
                    // chat-uikit-message-box-container__message__nickname-text
                    className={typeSafeBotNicknameVariants({
                      showBackground: Boolean(showBackground),
                    })}
                  >
                    {nickname}
                  </Typography.Text>
                  <UserLabel userLabel={userLabel} />
                  <div
                    // chat-uikit-message-box-container__message__nickname-partner
                    className="flex shrink w-full h-[20px]"
                  >
                    {isHovering && isHoverShowUserInfo ? (
                      <>
                        <UserName
                          userUniqueName={userUniqueName}
                          showBackground={showBackground}
                        />
                        <MentionOperateTool senderId={senderId} />
                        <MessageContentTime
                          contentTime={contentTime}
                          showBackground={Boolean(showBackground)}
                          className="flex-shrink-0"
                        />
                      </>
                    ) : null}

                    <div className="flex gap-x-[8px] ml-auto">
                      {topRightSlot}
                    </div>
                  </div>
                </div>
              ) : null}
              <div
                ref={messageContainerRef}
                // chat-uikit-message-box-container__message__message-box__content
                className={classnames(
                  messageBubbleWrapperClassname,
                  'select-text relative flex flex-row w-fit max-w-full',
                )}
              >
                <div
                  // className={classnames('chat-uikit-message-box-inner', {
                  //   'chat-uikit-message-box-inner--primary':
                  //     theme === 'primary',
                  //   'chat-uikit-message-box-inner--whiteness':
                  //     theme === 'whiteness',
                  //   'chat-uikit-message-box-inner--colorful':
                  //     theme === 'colorful',
                  //   'chat-uikit-message-box-inner--border': theme === 'border',
                  //   'chat-uikit-message-box-inner--none': theme === 'none',
                  //   '!coz-bg-image-user !coz-stroke-image-user':
                  //     showBackground && theme === 'primary',
                  //   '!coz-stroke-image-user !coz-bg-image-bots':
                  //     showBackground && theme === 'border',
                  //   '!coz-bg-image-bots !coz-stroke-image-bots':
                  //     showBackground && theme === 'whiteness',
                  //   'chat-uikit-message-box-inner--color-border':
                  //     theme === 'color-border',
                  //   'chat-uikit-message-box-inner--color-border-card':
                  //     theme === 'color-border-card',
                  // })}
                  className={classnames(
                    messageBubbleClassname,
                    typeSafeMessageBoxInnerVariants({
                      showBackground: Boolean(showBackground),
                      ...getMessageBoxInnerVariantsByTheme({ theme }),
                    }),
                    layout === Layout.MOBILE ? '!text-[16px]' : '',
                  )}
                >
                  <ErrorBoundary
                    errorBoundaryName="chat-message-box-children"
                    FallbackComponent={FallbackComponent}
                  >
                    {children}
                  </ErrorBoundary>
                </div>
                <div
                  // chat-uikit-message-box-container__message__message-box__content__right
                  className={classnames(
                    'absolute right-0 bottom-[1px]',
                    messageErrorWrapperClassname,
                  )}
                >
                  {right}
                </div>
              </div>
              {/* Please read the refreshContainerWidthConditionally above before changing the style of this dom */}
              <div
                ref={messageFooterRef}
                // chat-uikit-message-box-container__message__message-box__footer
                className="overflow-visible"
              >
                {renderFooter?.(refreshContainerWidthConditionally)}
              </div>
              {isHovering || hoverContentVisible ? (
                <div
                  // chat-uikit-message-box-container__message__message-box__hover-container
                  className="absolute right-[-12px] bottom-[-20px]"
                >
                  {hoverContent}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </UIKitMessageBoxProvider>
  );
};

MessageBoxWrap.displayName = 'UIKitMessageBoxWrap';
