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

import {
  CustomEventEmitter,
  RetryCounter,
  FetchDataHelper,
  inValidChunkRaw,
  getMessageLifecycleCallbackParam,
} from '@/channel/http-chunk/utils';

describe('CustomEventEmitter', () => {
  it('should emit custom events with the correct parameters', () => {
    const emitter = new CustomEventEmitter();
    const mockListener = vi.fn();

    emitter.on('message', mockListener);
    emitter.customEmit('message', { seq_id: 1 });

    expect(mockListener).toHaveBeenCalledWith({ seq_id: 1 });
  });
});

describe('RetryCounter', () => {
  it('should increment attempts and match maxRetryAttempts correctly', () => {
    const retryCounter = new RetryCounter({ maxRetryAttempts: 2 });

    retryCounter.add();
    expect(retryCounter.matchMaxRetryAttempts()).toBe(false);

    retryCounter.add();
    expect(retryCounter.matchMaxRetryAttempts()).toBe(true);
  });

  it('should reset attempts', () => {
    const retryCounter = new RetryCounter({ maxRetryAttempts: 2 });
    retryCounter.add();
    retryCounter.reset();
    expect(retryCounter.matchMaxRetryAttempts()).toBe(false);
  });
});

describe('FetchDataHelper', () => {
  it('should set and get replyID correctly', () => {
    const helper = new FetchDataHelper({ localMessageID: '123' });
    helper.setReplyID('reply123');
    expect(helper.replyID).toBe('reply123');
  });

  it('should set and get seqID correctly', () => {
    const helper = new FetchDataHelper({ localMessageID: '123' });
    helper.setSeqID(1);
    expect(helper.seqID).toBe(1);
  });

  it('should set and get logID correctly', () => {
    const helper = new FetchDataHelper({ localMessageID: '123' });
    helper.setLogID('log123');
    expect(helper.logID).toBe('log123');
  });

  it('should not set logID if null is passed', () => {
    const helper = new FetchDataHelper({ localMessageID: '123' });
    helper.setLogID(null);
    expect(helper.logID).toBeUndefined();
  });
});

describe('inValidChunkRaw', () => {
  it('should return true for valid ChunkRaw objects', () => {
    const validChunkRaw = { seq_id: 1, message: 'test', is_finish: false };
    expect(inValidChunkRaw(validChunkRaw)).toBe(true);
  });

  it('should return false for invalid ChunkRaw objects', () => {
    const invalidChunkRaw = { message: 'test' };
    expect(inValidChunkRaw(invalidChunkRaw)).toBe(false);
  });
});

describe('getMessageLifecycleCallbackParam', () => {
  it('should return correct parameters for a given FetchDataHelper', () => {
    const helper = new FetchDataHelper({
      localMessageID: '123',
    });
    const params = getMessageLifecycleCallbackParam(helper);

    expect(params).toEqual({
      localMessageID: '123',
    });
  });

  it('should return empty values when FetchDataHelper is undefined', () => {
    const params = getMessageLifecycleCallbackParam(undefined);
    expect(params).toEqual({
      localMessageID: '',
      replyID: undefined,
      logID: undefined,
    });
  });
});
