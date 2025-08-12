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

import { ChunkProcessor, StreamBufferHelper } from '@/message/chunk-processor';

describe('StreamBufferHelper', () => {
  it('clears all message and chunk buffers', () => {
    const bufferHelper = new StreamBufferHelper();
    bufferHelper.pushChunk({ message: { message_id: '1' } });
    bufferHelper.concatContentAndUpdateMessage({
      message_id: '1',
      content: 'Hello',
    });
    bufferHelper.clearMessageBuffer();
    expect(bufferHelper.streamChunkBuffer).toHaveLength(0);
    expect(bufferHelper.streamMessageBuffer).toHaveLength(0);
  });

  it('filters and clears buffer by reply_id', () => {
    const bufferHelper = new StreamBufferHelper();
    bufferHelper.pushChunk({
      message: { message_id: '1', reply_id: 'a' },
    });
    bufferHelper.concatContentAndUpdateMessage({
      message_id: '1',
      reply_id: 'a',
      content: 'Hello',
    });
    bufferHelper.clearMessageBufferByReplyId('a');
    expect(bufferHelper.streamChunkBuffer).toHaveLength(0);
    expect(bufferHelper.streamMessageBuffer).toHaveLength(0);
  });
});

describe('ChunkProcessor', () => {
  it('processes and stores chunks correctly', () => {
    const chunkProcessor = new ChunkProcessor({});
    const chunk = {
      message: { message_id: '1', reply_id: 'a', content: 'Part 1' },
    };
    chunkProcessor.addChunkAndProcess(chunk);
    const processedMessage = chunkProcessor.getProcessedMessageByMessageId('1');
    expect(processedMessage.content).toBe('Part 1');
  });

  it('retrieves processed message by message_id', () => {
    const chunkProcessor = new ChunkProcessor({});
    const chunk = {
      message: { message_id: '1', reply_id: 'a', content: 'Part 1' },
    };
    chunkProcessor.addChunkAndProcess(chunk);
    const message = chunkProcessor.getProcessedMessageByMessageId('1');
    expect(message).not.toBeUndefined();
    expect(message.content).toBe('Part 1');
  });

  it('identifies final answer message correctly', () => {
    const chunkProcessor = new ChunkProcessor({});
    const chunk = {
      message: {
        type: 'verbose',
        message_id: '1',
        reply_id: 'reaa',
        content: JSON.stringify({
          msg_type: 'generate_answer_finish',
          data: JSON.stringify({}),
        }),
      },
    };
    chunkProcessor.addChunkAndProcess(chunk);
    const isFinal = chunkProcessor.isMessageAnswerEnd(chunk);
    expect(isFinal).toBe(true);
  });

  it('returns undefined if first reply message does not exist', () => {
    const chunkProcessor = new ChunkProcessor({});
    const chunk = {
      message: { message_id: '1', reply_id: 'a', content: 'First reply' },
    };
    const firstReplyMessage = chunkProcessor.getFirstReplyMessageByChunk(chunk);
    expect(firstReplyMessage).toBeUndefined();
  });
});
