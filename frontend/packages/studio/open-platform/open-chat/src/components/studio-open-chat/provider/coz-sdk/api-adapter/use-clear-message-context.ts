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

import { useMemo } from 'react';

import { type SceneConfig } from '@coze-common/chat-core';

export const useClearMessageContextAdapter = (): SceneConfig =>
  useMemo(() => {
    const onAfterResponse = [
      response => {
        const { data } = response;
        const { code, data: res } = data;
        return {
          ...response,
          data: {
            code,
            new_section_id: res.id,
          },
        };
      },
    ];
    return {
      url: '/v1/conversations/:conversation_id/clear',
      hooks: {
        onBeforeRequest: [
          requestConfig => {
            const conversationId = requestConfig.data.conversation_id;
            const url = `/v1/conversations/${conversationId}/clear`;
            return {
              ...requestConfig,
              url,
              data: { conversation_id: conversationId },
            };
          },
        ],
        onErrorResponse: onAfterResponse,
        onAfterResponse,
      },
    };
  }, []);
