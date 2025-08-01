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

/**
 * Process received Chunk messages
 * 1. Pretreatment: Deserialization
 * 2. Incremental message splicing
 */
import { cloneDeep, flow } from 'lodash-es';

import { safeJSONParse } from '../shared/utils/safe-json-parse';
import {
  type Message,
  ContentType,
  type ChunkRaw,
  type MessageContent,
  type VerboseContent,
  VerboseMsgType,
  type AnswerFinishVerboseData,
  FinishReasonType,
} from './types';

export class StreamBufferHelper {
  // One-time streaming pull message message cache
  streamMessageBuffer: Message<ContentType>[] = [];

  // Chunk message cache for one-time streaming pull
  streamChunkBuffer: ChunkRaw[] = [];

  /**
   * Added Chunk message cache
   */
  pushChunk(chunk: ChunkRaw) {
    this.streamChunkBuffer.push(chunk);
  }

  concatContentAndUpdateMessage(message: Message<ContentType>) {
    const previousIndex = this.streamMessageBuffer.findIndex(
      item => item.message_id === message.message_id,
    );
    // new
    if (previousIndex === -1) {
      this.streamMessageBuffer.push(message);
      return;
    }
    // update
    const previousMessage = this.streamMessageBuffer.at(previousIndex);
    message.content = (previousMessage?.content || '') + message.content;
    message.reasoning_content =
      (previousMessage?.reasoning_content ?? '') +
      (message.reasoning_content ?? '');

    message.content_obj = message.content;
    this.streamMessageBuffer.splice(previousIndex, 1, message);
  }

  /**
   * Clear message cache
   */
  clearMessageBuffer() {
    this.streamMessageBuffer = [];
    this.streamChunkBuffer = [];
  }

  /**
   * Clear related message cache reply_id
   * 1. reply_id equal reply
   * 2, reply_id message_id problem
   */
  clearMessageBufferByReplyId(reply_id: string) {
    this.streamMessageBuffer = this.streamMessageBuffer.filter(
      message =>
        message.reply_id !== reply_id && message.message_id !== reply_id,
    );
    this.streamChunkBuffer = this.streamChunkBuffer.filter(
      chunk =>
        chunk.message.reply_id !== reply_id &&
        chunk.message.message_id !== reply_id,
    );
  }

  /**
   * Get the chunk in the chunk buffer according to message_id
   */
  getChunkByMessageId(message_id: string) {
    return this.streamChunkBuffer.filter(
      chunk => chunk.message.message_id === message_id,
    );
  }
}

interface AddChunkAndProcessOptions {
  logId?: string;
}
export class ChunkProcessor {
  streamBuffer: StreamBufferHelper = new StreamBufferHelper();

  bot_id?: string;

  preset_bot?: string;

  enableDebug?: boolean;

  constructor(props: {
    bot_id?: string;
    preset_bot?: string;
    enableDebug?: boolean;
  }) {
    const { bot_id, preset_bot, enableDebug } = props;
    this.bot_id = bot_id;
    this.preset_bot = preset_bot;
    this.enableDebug = enableDebug;
  }
  /**
   *  Added chunk, unified processing of chunk messages
   */
  addChunkAndProcess(chunk: ChunkRaw, options?: AddChunkAndProcessOptions) {
    this.streamBuffer.pushChunk(chunk);
    flow(
      this.preProcessChunk.bind(this),
      this.concatChunkMessage.bind(this),
      this.assembleDebugMessage.bind(this),
    )(chunk, options) as Message<ContentType>;
  }

  /**
   * Get the processed message according to the chunk
   */
  getProcessedMessageByChunk(chunk: ChunkRaw) {
    return this.streamBuffer.streamMessageBuffer.find(
      message => message.message_id === chunk.message.message_id,
    ) as Message<ContentType>;
  }

  /**
   * Get processed messages according to message_id
   */
  getProcessedMessageByMessageId(message_id: string) {
    return this.streamBuffer.streamMessageBuffer.find(
      message => message.message_id === message_id,
    ) as Message<ContentType>;
  }

  /**
   * Get the received ack message according to the local_message_id
   */
  getAckMessageByLocalMessageId(local_message_id: string) {
    return this.streamBuffer.streamMessageBuffer.find(
      message =>
        message.extra_info.local_message_id === local_message_id &&
        message.type === 'ack',
    );
  }

  /**
   * Got the first reply according to chunk
   */
  getFirstReplyMessageByChunk(chunk: ChunkRaw) {
    const hasAck = this.streamBuffer.streamMessageBuffer.find(
      item => item.type === 'ack' && item.message_id === chunk.message.reply_id,
    );
    if (!hasAck) {
      return undefined;
    }
    return this.streamBuffer.streamMessageBuffer.find(
      item => item.type !== 'ack' && item.reply_id === chunk.message.reply_id,
    );
  }

  /**
   * Get ack according to chunk.
   */
  getAckMessageByChunk(chunk: ChunkRaw) {
    return this.streamBuffer.streamMessageBuffer.find(
      item => item.type === 'ack' && item.message_id === chunk.message.reply_id,
    );
  }

  /**
   * Determine whether it is the first reply message.
   * First reply except ack
   */
  isFirstReplyMessage(chunk: ChunkRaw) {
    // No ack yet, definitely no first reply.
    if (!this.getAckMessageByChunk(chunk)) {
      return false;
    }
    return !this.getFirstReplyMessageByChunk(chunk);
  }

  /**
   * Get all reply messages according to reply_id
   */
  getReplyMessagesByReplyId(reply_id: string) {
    return this.streamBuffer.streamMessageBuffer.filter(
      message => message.type !== 'ack' && message.reply_id === reply_id,
    );
  }

  /**
   * Get the length of all reply messages
   */
  getReplyMessagesLengthByReplyId(reply_id: string) {
    return `${this.getReplyMessagesByReplyId(reply_id).reduce(
      (acc, message) => acc + message.content.length,
      0,
    )}`;
  }

  /**
   * Use for local logs
   * @param message
   * @returns
   */
  appendDebugMessage(message: Message<ContentType>) {
    const cloneMessage = cloneDeep(message);
    cloneMessage.debug_messages = this.streamBuffer.getChunkByMessageId(
      message.message_id,
    );
    cloneMessage.stream_chunk_buffer = this.streamBuffer.streamChunkBuffer;
    cloneMessage.stream_message_buffer = this.streamBuffer.streamMessageBuffer;
    return cloneMessage;
  }

  /**
   * Is getting the final answer?
   */
  isMessageAnswerEnd(chunk: ChunkRaw): boolean {
    const { message } = chunk;
    // Find all corresponding replies
    const replyMessages = this.getReplyMessagesByReplyId(message.reply_id);
    // Find if there is a verbose message, and identify the end of the answer, and filter out the finish of the interrupt scene
    const finalAnswerVerboseMessage = replyMessages.find(replyMessage => {
      const { type, content } = replyMessage;
      if (type !== 'verbose') {
        return false;
      }
      const { value: verboseContent } = safeJSONParse<VerboseContent>(
        content,
        null,
      );
      if (!verboseContent) {
        return false;
      }
      const { value: verboseContentData } =
        safeJSONParse<AnswerFinishVerboseData>(verboseContent.data, null);

      // At present, there may be a finish package in a group. If you need to filter out the interrupt scene through finish_reason, you will get the finish that answers all the ends.
      return (
        verboseContent.msg_type === VerboseMsgType.GENERATE_ANSWER_FINISH &&
        verboseContentData?.finish_reason !== FinishReasonType.INTERRUPT
      );
    });
    return Boolean(finalAnswerVerboseMessage);
  }

  /**
   * preprocess message
   * 1. Deserialization
   * 2. Add bot_id, is_finish, index, logId
   * @param chunk
   * @param options
   * @returns
   */
  private preProcessChunk(
    chunk: ChunkRaw,
    options?: AddChunkAndProcessOptions,
  ): Message<ContentType> {
    const { message, is_finish, index } = chunk;
    const { logId } = options || {};

    return {
      mention_list: [],
      ...message,
      logId,
      bot_id: this.bot_id,
      preset_bot: this.preset_bot,
      is_finish,
      index,
      content_obj:
        message.content_type !== ContentType.Text
          ? safeJSONParse<MessageContent<ContentType>>(message.content, null)
              .value
          : message.content,
    };
  }

  /**
   * incremental message stitching
   * 1. For incremental messages, you need to splice the previous message
   */
  private concatChunkMessage(
    message: Message<ContentType>,
  ): Message<ContentType> {
    this.streamBuffer.concatContentAndUpdateMessage(message);

    return message;
  }

  // debug_message logic
  private assembleDebugMessage(
    message: Message<ContentType>,
  ): Message<ContentType> {
    if (!this.enableDebug) {
      return message;
    }
    // All message_id chunk messages pulled by a stream are returned at once
    message.debug_messages = this.streamBuffer.getChunkByMessageId(
      message.message_id,
    );
    return message;
  }
}
