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

/**
 * Think-tag state machine states.
 *
 * Reasoning models (DeepSeek-R1, Qwen3, etc.) may emit `<think>` / `</think>`
 * tags directly inside the `content` text field instead of using the dedicated
 * `reasoning_content` field. This parser extracts the thinking portion into
 * `reasoning_content` and strips the raw tags from the visible `content`.
 */
enum ThinkTagState {
  /** Normal content - outside any `<think>` block. */
  NORMAL = 'normal',
  /** Inside a `<think>` block - content is buffered as reasoning. */
  THINKING = 'thinking',
}

/**
 * Parses `<think>` / `</think>` tags from streaming text content.
 *
 * The parser is designed to handle incremental input where tags and content
 * may arrive split across multiple chunks. It maintains internal state so that
 * partial tags (e.g. `"<thi"` followed by `"nk>..."`) are correctly handled.
 */
export class ThinkTagParser {
  private state: ThinkTagState = ThinkTagState.NORMAL;

  /**
   * Buffer used to accumulate partial tag sequences that may span chunk
   * boundaries. For example, one chunk may end with `"<thi"` and the next
   * may start with `"nk>"`.
   */
  private pendingBuffer = '';

  /**
   * Process an incremental text chunk and return the separated result.
   *
   * @param newContent - The new text fragment appended in this chunk.
   * @returns An object with `content` (visible text) and `reasoningContent`
   *          (text extracted from inside `<think>` blocks).
   */
  process(newContent: string): { content: string; reasoningContent: string } {
    // Prepend any leftover partial tag buffer from the previous chunk.
    const text = this.pendingBuffer + newContent;
    this.pendingBuffer = '';

    let content = '';
    let reasoningContent = '';

    // The longest tag we need to look ahead for is `</think>` (8 chars).
    // If the text ends with a *prefix* of either tag, we stash it into
    // `pendingBuffer` and process only the safe portion.
    const safeText = this.extractPendingSafePrefix(text);

    let i = 0;
    while (i < safeText.length) {
      if (this.state === ThinkTagState.NORMAL) {
        const openIdx = safeText.indexOf('<think>', i);
        if (openIdx === -1) {
          // No more `<think>` tags - rest is normal content.
          content += safeText.slice(i);
          break;
        }
        // Append everything before the tag as normal content.
        content += safeText.slice(i, openIdx);
        i = openIdx + '<think>'.length;
        this.state = ThinkTagState.THINKING;
      } else {
        // THINKING state - look for `</think>`.
        const closeIdx = safeText.indexOf('</think>', i);
        if (closeIdx === -1) {
          // No closing tag yet - rest is reasoning content.
          reasoningContent += safeText.slice(i);
          break;
        }
        // Append everything before the closing tag as reasoning.
        reasoningContent += safeText.slice(i, closeIdx);
        i = closeIdx + '</think>'.length;
        this.state = ThinkTagState.NORMAL;
      }
    }

    return { content, reasoningContent };
  }

  /**
   * Reset the parser to its initial state.
   */
  reset(): void {
    this.state = ThinkTagState.NORMAL;
    this.pendingBuffer = '';
  }

  /**
   * If the text ends with a prefix of `<think>` or `</think>`, move that
   * prefix into `pendingBuffer` and return only the safe (fully parseable)
   * portion.
   */
  private extractPendingSafePrefix(text: string): string {
    const TAGS = ['<think>', '</think>'];
    for (const tag of TAGS) {
      for (let prefixLen = 1; prefixLen < tag.length; prefixLen++) {
        const prefix = tag.slice(0, prefixLen);
        if (text.endsWith(prefix)) {
          this.pendingBuffer = prefix;
          return text.slice(0, text.length - prefixLen);
        }
      }
    }
    return text;
  }
}

export class StreamBufferHelper {
  // One-time streaming pull message message cache
  streamMessageBuffer: Message<ContentType>[] = [];

  // Chunk message cache for one-time streaming pull
  streamChunkBuffer: ChunkRaw[] = [];

  /**
   * Per-message think-tag parsers, keyed by `message_id`.
   * Lazily created when the first chunk for a message is processed.
   */
  private thinkTagParsers: Map<string, ThinkTagParser> = new Map();

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
      // For text messages, run think-tag extraction on the initial content.
      if (
        message.content_type === ContentType.Text &&
        message.content
      ) {
        const parser = this.getOrCreateParser(message.message_id);
        const { content, reasoningContent } = parser.process(message.content);
        message.content = content;
        message.reasoning_content =
          (message.reasoning_content ?? '') + reasoningContent;
      }
      this.streamMessageBuffer.push(message);
      return;
    }
    // update
    const previousMessage = this.streamMessageBuffer.at(previousIndex);
    const rawNewContent = message.content;

    // For text messages, parse think-tags from the incremental content.
    if (
      message.content_type === ContentType.Text &&
      rawNewContent
    ) {
      const parser = this.getOrCreateParser(message.message_id);
      const { content, reasoningContent } = parser.process(rawNewContent);

      message.content = (previousMessage?.content || '') + content;
      message.reasoning_content =
        (previousMessage?.reasoning_content ?? '') + reasoningContent;
    } else {
      message.content = (previousMessage?.content || '') + message.content;
      message.reasoning_content =
        (previousMessage?.reasoning_content ?? '') +
        (message.reasoning_content ?? '');
    }

    message.content_obj = message.content;
    this.streamMessageBuffer.splice(previousIndex, 1, message);
  }

  /**
   * Clear message cache
   */
  clearMessageBuffer() {
    this.streamMessageBuffer = [];
    this.streamChunkBuffer = [];
    this.thinkTagParsers.clear();
  }

  /**
   * Clear related message cache reply_id
   * 1. reply_id equal reply
   * 2, reply_id message_id problem
   */
  clearMessageBufferByReplyId(reply_id: string) {
    const removedMessageIds = new Set<string>();
    this.streamMessageBuffer.forEach(msg => {
      if (msg.reply_id === reply_id || msg.message_id === reply_id) {
        removedMessageIds.add(msg.message_id);
      }
    });
    this.streamMessageBuffer = this.streamMessageBuffer.filter(
      message =>
        message.reply_id !== reply_id && message.message_id !== reply_id,
    );
    this.streamChunkBuffer = this.streamChunkBuffer.filter(
      chunk =>
        chunk.message.reply_id !== reply_id &&
        chunk.message.message_id !== reply_id,
    );
    // Clean up think-tag parsers for removed messages.
    removedMessageIds.forEach(id => this.thinkTagParsers.delete(id));
  }

  /**
   * Get the chunk in the chunk buffer according to message_id
   */
  getChunkByMessageId(message_id: string) {
    return this.streamChunkBuffer.filter(
      chunk => chunk.message.message_id === message_id,
    );
  }

  /**
   * Lazily create or retrieve a ThinkTagParser for a given message.
   */
  private getOrCreateParser(messageId: string): ThinkTagParser {
    let parser = this.thinkTagParsers.get(messageId);
    if (!parser) {
      parser = new ThinkTagParser();
      this.thinkTagParsers.set(messageId, parser);
    }
    return parser;
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
