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

import { filterEmptyField } from '@/shared/utils/data-handler';
import { type ReportLog } from '@/report-log';
import type {
  ClearMessageContextParams,
  GetHistoryMessageResponse,
} from '@/message/types/message-manager';
import { MessageManager } from '@/message/message-manager';
import { type ChunkProcessor } from '@/message';
import { type HttpChunk } from '@/channel/http-chunk';

import {
  type ChatASRParams,
  type BreakMessageParams,
  type DeleteMessageParams,
  type GetHistoryMessageParams,
  type ReportMessageParams,
} from '../types/services/message-manager-service';
import type { Scene } from '../types/interface';
import {
  type ReportEventsTracer,
  SlardarEvents,
} from '../events/slardar-events';

export interface MessageManagerServiceProps {
  messageManager: MessageManager;
  conversation_id: string;
  scene?: Scene;
  bot_id: string;
  preset_bot: string;
  draft_mode?: boolean;
  httpChunk: HttpChunk;
  chunkProcessor: ChunkProcessor;
  reportEventsTracer: ReportEventsTracer;
  reportLogWithScope: ReportLog;
}

export class MessageManagerService {
  messageManager: MessageManager;
  conversation_id: string;
  scene?: Scene;
  bot_id: string;
  preset_bot: string;
  draft_mode?: boolean;
  httpChunk: HttpChunk;
  chunkProcessor: ChunkProcessor;
  reportEventsTracer: ReportEventsTracer;
  reportLogWithScope: ReportLog;
  constructor({
    messageManager,
    conversation_id,
    scene,
    bot_id,
    preset_bot,
    draft_mode,
    httpChunk,
    chunkProcessor,
    reportEventsTracer,
    reportLogWithScope,
  }: MessageManagerServiceProps) {
    this.messageManager = messageManager;
    this.conversation_id = conversation_id;
    this.scene = scene;
    this.bot_id = bot_id;
    this.preset_bot = preset_bot;
    this.draft_mode = draft_mode;
    this.httpChunk = httpChunk;
    this.chunkProcessor = chunkProcessor;
    this.reportEventsTracer = reportEventsTracer;
    this.reportLogWithScope = reportLogWithScope;
  }
  /**
   * Get chat history
   */
  async getHistoryMessage(props: GetHistoryMessageParams) {
    const params = filterEmptyField({
      conversation_id: this.conversation_id,
      scene: this.scene,
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
      draft_mode: this.draft_mode,
      ...props,
    });
    return await this.messageManager.getHistoryMessage(params);
  }

  convertMessageList = (data: GetHistoryMessageResponse['message_list']) =>
    MessageManager.convertMessageList(data);

  /**
   * Clear the conversation context
   */
  async clearMessageContext(params: ClearMessageContextParams) {
    return await this.messageManager.clearMessageContextUrl({
      conversation_id: this.conversation_id,
      scene: this.scene,
      ...params,
    });
  }

  /**
   * Clear history
   */
  async clearHistory() {
    return await this.messageManager.clearHistory({
      bot_id: this.bot_id,
      conversation_id: this.conversation_id,
      scene: this.scene,
    });
  }

  /**
   * delete message
   */
  async deleteMessage(params: DeleteMessageParams) {
    return await this.messageManager.deleteMessage({
      bot_id: this.bot_id,
      conversation_id: this.conversation_id,
      scene: this.scene,
      ...params,
    });
  }

  /**
   * Like/click on the message
   */
  async reportMessage(params: ReportMessageParams) {
    return await this.messageManager.reportMessage({
      bot_id: this.bot_id,
      biz_conversation_id: this.conversation_id,
      scene: this.scene,
      ...params,
    });
  }

  /**
   * interrupt message
   */
  async breakMessage(params: BreakMessageParams) {
    this.httpChunk.abort(params.local_message_id);
    const contentLength = this.chunkProcessor.getReplyMessagesLengthByReplyId(
      params.query_message_id,
    );
    this.reportEventsTracer?.pullStreamTracer.break(params.local_message_id, {
      contentLength,
    });
    this.reportLogWithScope.slardarEvent({
      eventName: SlardarEvents.SDK_BREAK_MESSAGE,
      meta: {
        ...params,
      },
    });
    return await this.messageManager.breakMessage({
      conversation_id: this.conversation_id,
      scene: this.scene,
      ...params,
    });
  }

  /**
   * ASR speech-to-text
   */
  async chatASR(params: ChatASRParams) {
    return await this.messageManager.chatASR(params);
  }
}
