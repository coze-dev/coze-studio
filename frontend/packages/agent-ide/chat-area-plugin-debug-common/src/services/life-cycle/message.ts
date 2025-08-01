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

import { useMultiAgentStore } from '@coze-studio/bot-detail-store/multi-agent';
import { useManuallySwitchAgentStore } from '@coze-studio/bot-detail-store';
import {
  CODE_JINJA_FORMAT_ERROR,
  type WriteableMessageLifeCycleServiceGenerator,
  parseErrorInfoFromErrorMessage,
  ChatBusinessErrorCode,
  getBotState,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { messageReportEvent } from '@coze-arch/bot-utils';
import { CustomError } from '@coze-arch/bot-error';

import {
  handleBotStateBeforeSendMessage,
  isCreateTaskMessage,
  reportReceiveEvent,
  sendTeaEventOnBeforeSendMessage,
} from '../../utils';
import { type PluginBizContext } from '../../types/biz-context';

export const messageLifeCycleServiceGenerator: WriteableMessageLifeCycleServiceGenerator<
  PluginBizContext
> = plugin => ({
  onMessagePullingSuccess() {
    messageReportEvent.messageReceiveSuggestsEvent.success();
  },
  onSendMessageError(ctx) {
    const { error: inputError } = ctx;
    if (
      (inputError as { ext?: { code?: number } }).ext?.code ===
      CODE_JINJA_FORMAT_ERROR
    ) {
      Toast.warning(I18n.t('jinja_invalid'));
    }

    const error =
      inputError instanceof Error
        ? inputError
        : new CustomError('normal_error', 'unknow');
    const reason = error.message;
    messageReportEvent.executeDraftBotEvent.error({ error, reason });
  },
  onAfterSendMessage() {
    messageReportEvent.executeDraftBotEvent.success();
    messageReportEvent.receiveMessageEvent.start();
  },
  onBeforeSendMessage(ctx) {
    const { botId, scene } = plugin.pluginBizContext;
    messageReportEvent.executeDraftBotEvent.start();
    sendTeaEventOnBeforeSendMessage({
      message: ctx.message,
      from: ctx.from,
      botId,
    });

    const result = handleBotStateBeforeSendMessage(ctx, scene);

    return {
      ...ctx,
      ...result,
    };
  },
  onBeforeProcessReceiveMessage(ctx) {
    const { message } = ctx;

    const { pluginBizContext } = plugin;
    const {
      methods: { refreshTaskList },
    } = pluginBizContext;

    reportReceiveEvent(message);

    // If it is a message to create a scheduled task, you need to refresh the task list.
    if (isCreateTaskMessage(message)) {
      refreshTaskList();
    }

    const botState = getBotState(message.extra_info.bot_state);
    const agentId = botState?.agent_id;
    if (agentId) {
      useManuallySwitchAgentStore.getState().clearAgentId();
      useMultiAgentStore.getState().setMultiAgent({ currentAgentID: agentId });
    }

    return ctx;
  },
  onMessagePullingError(ctx) {
    const errorInfo = parseErrorInfoFromErrorMessage(ctx.error?.message);
    if (!errorInfo) {
      return;
    }
    if (errorInfo.code === ChatBusinessErrorCode.SuggestError) {
      messageReportEvent.messageReceiveSuggestsEvent.error({
        error: ctx.error,
        reason: errorInfo.msg,
      });
      return;
    }
    messageReportEvent.receiveMessageEvent.error();
  },
});
