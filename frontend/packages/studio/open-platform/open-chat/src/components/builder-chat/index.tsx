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

import '@coze/chat-sdk/webCss';
import { forwardRef, useMemo, type Ref, useImperativeHandle } from 'react';

import {
  openApiHostByRegionWithToken,
  openApiCdnUrlByRegion,
} from '@coze-studio/open-env-adapter';
import { I18n } from '@coze-arch/i18n';
import ChatSdk from '@coze/chat-sdk/webJs';
import {
  type RawMessage,
  type IChatFlowProps,
  type Language,
} from '@coze/chat-sdk';

import { type IBuilderChatProps, type BuilderChatRef } from '@/types';

const {
  ChatFlowFramework,
  ChatSlot,
  useSendMessage,
  ChatType,
  RawMessageType,
} = ChatSdk;

export { ChatType, RawMessageType };
export const ChatContent = forwardRef(
  (_props: {}, ref: Ref<BuilderChatRef>) => {
    const { sendMessage } = useSendMessage();
    useImperativeHandle(
      ref,
      () => ({
        sendMessage: (message: RawMessage) => {
          sendMessage(message);
        },
      }),
      [sendMessage],
    );
    return <ChatSlot />;
  },
);

export const BuilderChat = forwardRef(
  (props: IBuilderChatProps, ref: Ref<BuilderChatRef>) => {
    const { workflow } = props;
    const eventCallbacks: IChatFlowProps['eventCallbacks'] = useMemo(
      () => ({
        onImageClick: props.eventCallbacks?.onImageClick,
        onGetChatFlowExecuteId: props.eventCallbacks?.onGetChatFlowExecuteId,
        onThemeChange: props.eventCallbacks?.onThemeChange,
        onInitSuccess: props.eventCallbacks?.onInitSuccess,
        message: {
          afterMessageReceivedFinish:
            props.eventCallbacks?.afterMessageReceivedFinish,
        },
      }),
      [props.eventCallbacks],
    );
    const { userInfo } = props;
    const { auth } = props;
    const areaUi: IChatFlowProps['areaUi'] = useMemo(
      // eslint-disable-next-line complexity
      () => ({
        layout: props.project?.layout,
        isDisabled: props.areaUi?.isDisabled,
        input: {
          isNeed: props.areaUi?.input?.isShow,
          isNeedAudio: props.areaUi?.input?.isNeedAudio ?? !IS_OVERSEA,
          placholder: props.areaUi?.input?.placeholder,
          isNeedTaskMessage: props.areaUi?.input?.isNeedTaskMessage,
          defaultText: props.areaUi?.input?.defaultText,
          renderChatInputTopSlot: props.areaUi?.input?.renderChatInputTopSlot,
        },
        clearContext:
          props.project?.mode === 'websdk'
            ? {
                isNeed: true,
                position: 'inputLeft',
              }
            : {
                isNeed: false,
              },
        clearMessage:
          props.project?.mode === 'websdk'
            ? {
                isNeed: true,
                position: 'headerRight',
              }
            : {
                isNeed:
                  props.areaUi?.isNeedClearMessage !== undefined
                    ? props.areaUi?.isNeedClearMessage
                    : true,
                position: 'inputLeft',
              },
        uploadBtn: {
          isNeed: props.areaUi?.uploadable,
        },
        uiTheme: props.areaUi?.uiTheme,
        renderLoading: props.areaUi?.renderLoading,
        header: {
          isNeed: props.areaUi?.header?.isShow || false,
          icon: props.project?.iconUrl,
          title: props.project?.name,
          renderRightSlot: () => <>{props.areaUi?.header?.extra || null}</>,
        },
        footer: props.areaUi?.footer,
      }),
      [props.areaUi, props.project],
    );
    const setting: IChatFlowProps['setting'] = useMemo(
      () => ({
        apiBaseUrl: openApiHostByRegionWithToken,
        cdnBaseUrlPath: openApiCdnUrlByRegion,
        language: I18n.language as Language,
        logLevel: IS_BOE ? 'debug' : 'release',
        ...(props.setting || {}),
      }),
      [],
    );
    const project: IChatFlowProps['project'] = useMemo(
      () => ({
        id: props.project?.id || '',
        type: props.project?.type,
        mode: props.project?.mode as 'release',
        caller: props.project?.caller,
        defaultName: props.project?.defaultName,
        defaultIconUrl: props.project?.defaultIconUrl,
        connectorId: props.project?.connectorId,
        conversationName: props.project?.conversationName,
        name: props.project?.name,
        iconUrl: props.project?.iconUrl,
        OnBoarding: props.project?.onBoarding,
      }),
      [props.project],
    );
    return (
      <>
        <ChatFlowFramework
          workflow={workflow}
          project={project}
          userInfo={userInfo}
          eventCallbacks={eventCallbacks}
          auth={auth}
          style={props.style}
          areaUi={areaUi}
          setting={setting}
        >
          <ChatContent ref={ref} />
        </ChatFlowFramework>
      </>
    );
  },
);
