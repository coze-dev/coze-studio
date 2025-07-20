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
 * 处理接收到的Chunk消息
 * 1、预处理：反序列化
 * 2、增量消息拼接
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
  // 一次流式拉取的message消息缓存
  streamMessageBuffer: Message<ContentType>[] = [];

  // 一次流式拉取的Chunk消息缓存
  streamChunkBuffer: ChunkRaw[] = [];

  /**
   * 新增Chunk消息缓存
   */
  pushChunk(chunk: ChunkRaw) {
    this.streamChunkBuffer.push(chunk);
  }

  concatContentAndUpdateMessage(message: Message<ContentType>) {
    const previousIndex = this.streamMessageBuffer.findIndex(
      item => item.message_id === message.message_id,
    );
    // 新增
    if (previousIndex === -1) {
      this.streamMessageBuffer.push(message);
      return;
    }
    // 更新
    const previousMessage = this.streamMessageBuffer.at(previousIndex);
    message.content = (previousMessage?.content || '') + message.content;
    message.reasoning_content =
      (previousMessage?.reasoning_content ?? '') +
      (message.reasoning_content ?? '');

    message.content_obj = message.content;
    this.streamMessageBuffer.splice(previousIndex, 1, message);
  }

  /**
   * 清空消息缓存
   */
  clearMessageBuffer() {
    this.streamMessageBuffer = [];
    this.streamChunkBuffer = [];
  }

  /**
   * 按reply_id清除相关消息缓存
   * 1、reply_id相等的回复
   * 2、reply_id为 message_id 的问题
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
   * 根据message_id获取chunk buffer中的chunk
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
   *  新增chunk, 统一处理后的Chunk消息
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
   * 根据chunk获取处理后的消息
   */
  getProcessedMessageByChunk(chunk: ChunkRaw) {
    return this.streamBuffer.streamMessageBuffer.find(
      message => message.message_id === chunk.message.message_id,
    ) as Message<ContentType>;
  }

  /**
   * 根据message_id获取处理后的消息
   */
  getProcessedMessageByMessageId(message_id: string) {
    return this.streamBuffer.streamMessageBuffer.find(
      message => message.message_id === message_id,
    ) as Message<ContentType>;
  }

  /**
   * 根据local_message_id获取接收到的ack消息
   */
  getAckMessageByLocalMessageId(local_message_id: string) {
    return this.streamBuffer.streamMessageBuffer.find(
      message =>
        message.extra_info.local_message_id === local_message_id &&
        message.type === 'ack',
    );
  }

  /**
   * 根据chunk获取到第一条回复
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
   * 根据chunk获取到ack
   */
  getAckMessageByChunk(chunk: ChunkRaw) {
    return this.streamBuffer.streamMessageBuffer.find(
      item => item.type === 'ack' && item.message_id === chunk.message.reply_id,
    );
  }

  /**
   * 判断是否是第一条回复消息
   * 除ack外的第一条回复
   */
  isFirstReplyMessage(chunk: ChunkRaw) {
    // 还没有ack，肯定没有第一条回复
    if (!this.getAckMessageByChunk(chunk)) {
      return false;
    }
    return !this.getFirstReplyMessageByChunk(chunk);
  }

  /**
   * 根据reply_id获取所有回复消息
   */
  getReplyMessagesByReplyId(reply_id: string) {
    return this.streamBuffer.streamMessageBuffer.filter(
      message => message.type !== 'ack' && message.reply_id === reply_id,
    );
  }

  /**
   * 获取所有回复消息的长度
   */
  getReplyMessagesLengthByReplyId(reply_id: string) {
    return `${this.getReplyMessagesByReplyId(reply_id).reduce(
      (acc, message) => acc + message.content.length,
      0,
    )}`;
  }

  /**
   * 给本地日志使用
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
   * 获取是否是final answer
   */
  isMessageAnswerEnd(chunk: ChunkRaw): boolean {
    const { message } = chunk;
    // 找到对应的所有回复
    const replyMessages = this.getReplyMessagesByReplyId(message.reply_id);
    // 查找是否有verbose消息, 并且标识answer结束，并且过滤掉中断场景的finish
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

      // 目前一个group内可能会有finish包，需要通过finish_reason过滤掉中断场景的，拿到的就是回答全部结束的finish
      return (
        verboseContent.msg_type === VerboseMsgType.GENERATE_ANSWER_FINISH &&
        verboseContentData?.finish_reason !== FinishReasonType.INTERRUPT
      );
    });
    return Boolean(finalAnswerVerboseMessage);
  }

  /**
   * 预处理消息
   * 1、反序列化
   * 2、添加 bot_id、is_finish、index, logId
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
   * 增量消息拼接
   * 1、对于增量消息，需要拼接上一次的消息
   */
  private concatChunkMessage(
    message: Message<ContentType>,
  ): Message<ContentType> {
    this.streamBuffer.concatContentAndUpdateMessage(message);

    return message;
  }

  // debug_message 逻辑
  private assembleDebugMessage(
    message: Message<ContentType>,
  ): Message<ContentType> {
    if (!this.enableDebug) {
      return message;
    }
    // 一次 stream拉取的所有message_id一样的 chunk 消息一次返回
    message.debug_messages = this.streamBuffer.getChunkByMessageId(
      message.message_id,
    );
    return message;
  }
}
