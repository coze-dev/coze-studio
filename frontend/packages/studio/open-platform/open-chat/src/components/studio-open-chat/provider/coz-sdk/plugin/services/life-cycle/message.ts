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

import { type ChatCoreError } from '@coze-common/chat-core';
import { type WriteableMessageLifeCycleServiceGenerator } from '@coze-common/chat-area';

import { isAuthError } from '@/util/error';

import { type PluginBizContext } from '../../types/biz-context';
export const messageLifeCycleServiceGenerator: WriteableMessageLifeCycleServiceGenerator<
  PluginBizContext
> = plugin => {
  let lastRetryId = '';
  return {
    onSendMessageError: async ctx => {
      const error = ctx.error as ChatCoreError;

      if (isAuthError(error?.ext?.code || 0) || error?.stack?.includes('401')) {
        await plugin.pluginBizContext?.refreshToken?.();
        const newRetryId =
          ctx.message.message_id || ctx.message?.extra_info?.local_message_id;
        if (newRetryId !== lastRetryId) {
          lastRetryId = newRetryId;
          plugin.pluginBizContext?.regenerateMessageByUserMessageId(newRetryId);
        }
      }
    },
  };
};
