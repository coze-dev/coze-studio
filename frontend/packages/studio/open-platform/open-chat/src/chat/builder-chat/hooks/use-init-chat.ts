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

import { useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import { useUpdateEffect } from 'ahooks';
import { patPermissionApi } from '@coze-arch/bot-api';

import { type StudioChatProviderProps } from '@/types/props';
import { OpenApiSource } from '@/types/open';
import { AuthType } from '@/types/client';

import { type IBuilderChatProps } from '../type';
import { getConnectorId } from '../helper/get-connector-id';

const getToken = async () => {
  try {
    const res = await patPermissionApi.ImpersonateCozeUser({});
    return res.data?.access_token ?? '';
  } catch (_err) {
    return '';
  }
};
const checkParam = (props: IBuilderChatProps) => {
  let error: Error | undefined;
  if (props?.project?.type === 'bot') {
    if (props?.project?.mode !== 'draft') {
      error = new Error('mode must be draft when project type is bot');
    }
  } else {
    if (props?.auth?.type !== 'internal') {
      if (!props?.auth?.token) {
        error = new Error('token is required when auth type is not internal');
      }
    }
  }
  return error;
};

// botId 、 token等修改
export const useInitChat = (
  props: IBuilderChatProps,
): {
  chatProps?: StudioChatProviderProps;
  hasReady: boolean;
  error: Error | null;
  refresh: () => void;
} => {
  const [hasReady, setHasReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [chatProps, setChatProps] = useState<StudioChatProviderProps>();
  const { project: projectInfo, userInfo } = props;

  useEffect(() => {
    if (error || hasReady) {
      return;
    }
    const errorTemp = checkParam(props);
    if (errorTemp) {
      setError(errorTemp);
      return;
    }
    (async () => {
      let token = props.auth?.token;
      let refreshToken = props.auth?.refreshToken;
      if (props.auth?.type === 'internal') {
        token = await getToken();
        refreshToken = getToken;
      }

      if (token) {
        setChatProps({
          chatConfig: {
            bot_id: projectInfo.id,
            auth: {
              type: AuthType.TOKEN,
              token,
              onRefreshToken: refreshToken,
              connectorId: getConnectorId(props),
            },
            ui: {
              base: {
                layout: projectInfo.layout,
              },
              chatBot: {
                uploadable: props.areaUi.uploadable,
                isNeedClearContext: props.areaUi.isNeedClearContext,
                isNeedClearMessage: props.areaUi.isNeedClearMessage,
                isNeedAddNewConversation:
                  props.areaUi.isNeedAddNewConversation ?? false, // 默认false
                isNeedAudio: props.areaUi.input?.isNeedAudio ?? !IS_OVERSEA,
                isNeedQuote: props.areaUi.isNeedQuote ?? false, // 默认false
                isNeedFunctionCallMessage:
                  props.areaUi.isNeedFunctionCallMessage,
                feedback: props.areaUi.feedback,
              },
            },
            conversation_id: '', // 无用，可先为空
            source: OpenApiSource.ChatFlow,
          },
          layout: projectInfo.layout,
          userInfo: {
            id: nanoid(),
            url: '',
            nickname: '',
            ...(userInfo || {}),
          },
        });
        setHasReady(true);
      } else {
        setError(new Error('token is empty'));
      }
    })();
  }, [error, hasReady]);
  useUpdateEffect(() => {
    setHasReady(false);
    setError(null);
  }, [
    projectInfo?.id,
    projectInfo?.type,
    projectInfo?.conversationName,
    projectInfo?.conversationId,
    projectInfo?.mode,
    projectInfo?.conversationId,
    props?.workflow?.id,
  ]);

  if (chatProps) {
    chatProps.chatConfig.ui = chatProps.chatConfig.ui || {};
    chatProps.chatConfig.ui.chatBot = chatProps.chatConfig.ui.chatBot || {};
    chatProps.chatConfig.ui.chatBot.isNeedClearMessage =
      props?.areaUi?.isNeedClearMessage;
    chatProps.chatConfig.ui.chatBot.uploadable = props.areaUi?.uploadable;
    chatProps.chatConfig.ui.chatBot.feedback = props.areaUi?.feedback;
  }
  return {
    hasReady,
    chatProps,
    error,
    refresh: () => {
      setError(null);
      setHasReady(false);
    },
  };
};
