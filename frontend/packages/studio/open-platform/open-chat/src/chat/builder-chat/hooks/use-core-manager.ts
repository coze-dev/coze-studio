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

import { useMemo, useRef } from 'react';

import {
  RequestScene,
  type RequestManagerOptions,
} from '@coze-common/chat-core';

import { openApiHostByRegionWithToken } from '@/util/env';

import { type IBuilderChatProps } from '../type';
import { getConnectorId } from '../helper/get-connector-id';
import { useGetAppDataCombineWithProps } from '../context/builder-chat-context';

export const useCoreManager = (
  props: IBuilderChatProps,
): RequestManagerOptions => {
  const refProps = useRef(props);
  const appData = useGetAppDataCombineWithProps();
  const refAppData = useRef(appData);
  refProps.current = props;
  refAppData.current = appData;
  return useMemo(
    () => ({
      scenes: {
        [RequestScene.SendMessage]: {
          hooks: {
            onBeforeSendMessage: [
              requestConfig => {
                const { body } = requestConfig;

                const bodyDataOld = JSON.parse(body);
                const bodyData: Record<string, unknown> = {};
                bodyData.additional_messages =
                  bodyDataOld.additional_messages || [];
                bodyData.connector_id = bodyDataOld.connector_id;
                bodyData.workflow_id = refProps?.current?.workflow?.id;
                bodyData.parameters = refProps?.current?.workflow?.parameters;
                bodyData.version =
                  refProps?.current?.project?.version || undefined;
                bodyData.execute_mode =
                  refProps?.current?.project?.mode === 'draft'
                    ? 'DEBUG'
                    : undefined;
                bodyData.app_id =
                  refProps?.current?.project?.type === 'app'
                    ? refProps?.current?.project?.id
                    : undefined;
                bodyData.bot_id =
                  refProps?.current?.project?.type === 'bot'
                    ? refProps?.current?.project?.id
                    : undefined;
                bodyData.conversation_id = new URL(
                  requestConfig.url,
                ).searchParams.get('conversation_id');
                bodyData.connector_id = getConnectorId(refProps?.current);
                bodyData.ext = {
                  _caller: refProps?.current?.project?.caller,
                  user_id: bodyDataOld.user_id,
                };
                bodyData.suggest_reply_info = refAppData.current
                  ?.suggestPromoteInfo
                  ? {
                      suggest_reply_mode:
                        refAppData.current?.suggestPromoteInfo
                          ?.suggestReplyMode,
                      customized_suggest_prompt:
                        refAppData.current?.suggestPromoteInfo
                          ?.customizedSuggestPrompt,
                    }
                  : undefined;
                requestConfig.body = JSON.stringify(bodyData);
                requestConfig.url = `${openApiHostByRegionWithToken}/v1/workflows/chat`;
                requestConfig.headers.push(
                  ...Object.entries(refProps.current?.workflow?.header || {}),
                );

                return {
                  ...requestConfig,
                };
              },
            ],
          },
        },
        [RequestScene.ClearHistory]: {
          hooks: {
            onBeforeRequest: [
              requestConfig => {
                if (props?.project?.type === 'bot') {
                  requestConfig.data = {
                    connector_id: getConnectorId(props),
                  };
                } else {
                  requestConfig.data = {
                    app_id: refProps?.current.project?.id,
                    conversation_name:
                      refProps?.current?.project?.conversationName,
                    get_or_create: false,
                    workflow_id: refProps?.current?.workflow?.id,
                    draft_mode: refProps?.current?.project?.mode === 'draft',
                    connector_id: getConnectorId(props),
                  };
                }

                return {
                  ...requestConfig,
                };
              },
            ],
          },
        },
      },
    }),
    [],
  );
};
