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
  useEffect,
  useImperativeHandle,
  useMemo,
  type FC,
  forwardRef,
  type Ref,
  useRef,
  type PropsWithChildren,
  useState,
  memo,
} from 'react';

import cls from 'classnames';
import { type InputController } from '@coze-common/chat-uikit-shared';
import { ContentType } from '@coze-common/chat-core/message/types';
import {
  useSendTextMessage,
  useSendNormalizedMessage,
} from '@coze-common/chat-area/hooks/messages/use-send-message';
import { useClearContext } from '@coze-common/chat-area/hooks/messages/use-clear-context';
import { useInitStatus } from '@coze-common/chat-area/hooks/context/use-init-status';
import { I18n } from '@coze-arch/i18n';

import type { StudioChatProviderProps } from '@/types/props';
import { Layout } from '@/types/client';
import { useGetTheme } from '@/components/studio-open-chat/hooks/use-get-theme';
import {
  OpenChatProvider,
  StudioChatArea,
} from '@/components/studio-open-chat';
import { Loading } from '@/components/loading';
import { ChatHeader } from '@/components/header';
import ChatFooter from '@/components/footer';
import ErrorFallback, {
  type InitErrorFallback,
} from '@/components/error-fallback';
import { ErrorBoundary } from '@/components/error-boundary';

import {
  type IBuilderChatProps,
  type MessageType,
  type BuilderChatRef,
} from './type';
import { getBuilderEventCallbackPlugin } from './plugins/event-callback';
import { useRequestInit } from './hooks/use-request-init';
import { useOnboardingUpdate } from './hooks/use-on-boarding-update';
import { useInitChat } from './hooks/use-init-chat';
import { useCoreManager } from './hooks/use-core-manager';
import { useBotAndUserUpdate } from './hooks/use-bot-user-update';
import { type InitData } from './data-type';
import {
  BuilderChatProvider,
  useGetAppDataCombineWithProps,
  useUpdateAppDataCombineWithProps,
} from './context/builder-chat-context';
import { Background } from './components/background';
import { AuditPanel } from './components/audit-panel';

import styles from './index.module.less';

export { type BuilderChatRef };

export const BuilderChatContent = forwardRef(
  (
    {
      uiBuilderProps,
      chatProps,
    }: {
      chatProps: StudioChatProviderProps;
      uiBuilderProps: IBuilderChatProps;
    },
    ref: Ref<BuilderChatRef>,
  ) => {
    const refHasInitController = useRef(false);
    const refInputController = useRef<InputController>();
    const { areaUi } = uiBuilderProps;
    const handleClearContext = useClearContext();
    const sendMessage = useSendNormalizedMessage();
    const sendTextMessage = useSendTextMessage();
    useOnboardingUpdate();
    useBotAndUserUpdate();
    useImperativeHandle(
      ref,
      () => ({
        sendMessage: (message: MessageType) => {
          if (message.type === ContentType.Text) {
            sendTextMessage({ text: message.text, mentionList: [] }, 'other');
          } else if (message.type === ContentType.Image) {
            sendMessage(
              {
                payload: {
                  contentType: ContentType.Image,
                  contentObj: {
                    image_list: [message.value],
                  },
                  mention_list: [],
                },
              },
              'other',
            );
          } else if (message.type === 'file') {
            sendMessage(
              {
                payload: {
                  contentType: ContentType.File,
                  contentObj: {
                    file_list: [message.value],
                  },
                  mention_list: [],
                },
              },
              'other',
            );
          }
        },
        clearContext: () => {
          handleClearContext?.();
        },
      }),
      [handleClearContext, sendTextMessage, sendMessage],
    );
    useEffect(() => {
      refInputController.current?.setInputText?.(
        areaUi?.input?.defaultText || '',
      );
    }, [areaUi?.input?.defaultText]);
    const renderChatInputTopSlot = areaUi?.input?.renderChatInputTopSlot
      ? () => areaUi?.input?.renderChatInputTopSlot?.(false)
      : undefined;
    const isMobile = uiBuilderProps.project?.layout === Layout.MOBILE;
    const theme = useGetTheme();
    const { header } = uiBuilderProps.areaUi || {};

    return (
      <StudioChatArea
        {...chatProps}
        {...(areaUi || {})}
        coreAreaClassName={styles['core-area']}
        inputPlaceholder={
          areaUi?.input?.placeholder || I18n.t('chatInputPlaceholder')
        }
        messageMaxWidth={
          uiBuilderProps?.project?.mode !== 'websdk' ? '600px' : undefined
        }
        enableMultimodalUpload={true}
        showInputArea={areaUi?.input?.isShow}
        messageGroupListClassName={styles['scroll-view']}
        renderChatInputTopSlot={renderChatInputTopSlot}
        isShowClearContextDivider={true}
        headerNode={
          <ChatHeader
            title={header?.title || ''}
            iconUrl={header?.icon}
            extra={header?.extra}
            theme={theme}
            isMobile={isMobile}
            isShowConversations={false} // app 这期不支持
            isShowHeader={header?.isShow}
          />
        }
        isMiniScreen={areaUi?.uiTheme === 'chatFlow' ? true : false}
        inputNativeCallbacks={{
          getController: inputControllerIn => {
            refInputController.current = inputControllerIn;
            if (!refHasInitController.current) {
              refInputController.current?.setInputText?.(
                areaUi?.input?.defaultText || '',
              );
              refHasInitController.current = true;
            }
          },
        }}
      />
    );
  },
);

const getErrorCallbackComp =
  (props: IBuilderChatProps & { refresh: () => void }): FC<InitErrorFallback> =>
  ({ error, onBeforeRetry }) => (
    <>
      <ErrorFallback
        error={error}
        onBeforeRetry={onBeforeRetry}
        refresh={props.refresh}
      />
      {props.areaUi?.input?.renderChatInputTopSlot?.(true)}
    </>
  );
const BuilderChatWrap: FC<PropsWithChildren<IBuilderChatProps>> = ({
  children,
  ...props
}) => {
  const initStatus = useInitStatus();
  const theme = useGetTheme();
  const { footer } = props.areaUi || {};
  const isMobile = props.project?.layout === Layout.MOBILE;
  const appInfoResult = useGetAppDataCombineWithProps();

  const footerConfig = {
    ...(footer || {
      expressionText: '',
    }),
  };

  if (props.project?.mode !== 'websdk') {
    if (!footerConfig.expressionText) {
      footerConfig.expressionText = I18n.t('chat_GenAI_tips');
    }
  }
  if (initStatus !== 'initSuccess') {
    return props?.areaUi?.renderLoading?.() || <Loading />;
  }
  return (
    <div
      className={cls(styles.content, {
        [styles.mobile]: isMobile,
        [styles['bg-theme']]: theme === 'bg-theme',
      })}
      style={props.style}
    >
      <div
        className={cls(styles.area, {
          [styles['chat-flow-area']]: props.areaUi?.uiTheme === 'chatFlow',
          [styles['chat-ui-builder']]: props.areaUi?.uiTheme === 'uiBuilder',
        })}
      >
        <Background bgInfo={appInfoResult?.customBgInfo} />
        {children}
      </div>
      <ChatFooter {...footerConfig} theme={theme} />
    </div>
  );
};
const BuilderChatContainer = memo(
  forwardRef((props: IBuilderChatProps, ref: Ref<BuilderChatRef>) => {
    const { chatProps, hasReady, error, refresh } = useInitChat(props);
    const openRequestInit = useRequestInit(props);

    const builderEventCallbackPlugin = getBuilderEventCallbackPlugin({
      eventCallbacks: props.eventCallbacks,
    });
    const appInfoResult = useGetAppDataCombineWithProps();
    useUpdateAppDataCombineWithProps(props);
    const plugins = [builderEventCallbackPlugin];

    const requestManagerOptions = useCoreManager(props);

    const userInfo = useMemo(
      () => ({
        url: '',
        nickname: '',
        ...(props.userInfo || {}),
        id: props?.userInfo?.id || chatProps?.userInfo?.id || '',
      }),
      [props?.userInfo, chatProps],
    );
    const ErrorFallbackComp = getErrorCallbackComp({ ...props, refresh });
    if (props?.project?.mode === 'audit') {
      return <AuditPanel {...props} />;
    }
    if (error) {
      return <ErrorFallbackComp error={null} refresh={refresh} />;
    }
    if (!chatProps || !hasReady) {
      return props?.areaUi?.renderLoading?.() || <Loading />;
    }
    const isCustomBackground = !!appInfoResult?.customBgInfo?.imgUrl || false;
    console.log(
      '[result] isCustomBackground:',
      isCustomBackground,
      appInfoResult?.customBgInfo,
    );

    return (
      <OpenChatProvider
        {...chatProps}
        userInfo={userInfo}
        openRequestInit={openRequestInit}
        plugins={plugins}
        requestManagerOptions={requestManagerOptions}
        initErrorFallbackFC={ErrorFallbackComp}
        onImageClick={props.eventCallbacks?.onImageClick}
        debug={props.debug}
        isCustomBackground={isCustomBackground}
        onThemeChange={props?.eventCallbacks?.onThemeChange}
        readonly={props?.areaUi?.isDisabled}
        spaceId={props?.spaceId}
      >
        <BuilderChatWrap {...props}>
          <BuilderChatContent
            ref={ref}
            uiBuilderProps={props}
            chatProps={chatProps}
          />
        </BuilderChatWrap>
      </OpenChatProvider>
    );
  }),
);
export const BuilderChatWeb = forwardRef(
  (props: IBuilderChatProps, ref: Ref<BuilderChatRef>) => {
    const [appDataFromOnLine, setAppDataFromOnLine] = useState<InitData | null>(
      null,
    );
    const [appDataCombineWithProps, setAppDataCombineWithProps] =
      useState<InitData | null>(null);

    return (
      <ErrorBoundary>
        <BuilderChatProvider
          {...{
            appDataFromOnLine,
            setAppDataFromOnLine,
            appDataCombineWithProps,
            setAppDataCombineWithProps,
          }}
        >
          <BuilderChatContainer ref={ref} {...props} />
        </BuilderChatProvider>
      </ErrorBoundary>
    );
  },
);
