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

import { type ReportLog } from '@/report-log';
import { type ChatCoreError } from '@/custom-error';
import {
  ReportEventsTracer,
  SlardarEvents,
} from '@/chat-sdk/events/slardar-events';

describe('ReportEventsTracer', () => {
  let reporter: ReportLog;
  let tracer: ReportEventsTracer;

  beforeEach(() => {
    reporter = {
      slardarTracer: vi.fn(),
    } as unknown as ReportLog;
    tracer = new ReportEventsTracer(reporter);
  });

  it('sendMessageTracer start should create a tracer and call trace start', () => {
    const localMessageId = '123';
    const trace = vi.fn();
    vi.spyOn(tracer, 'createTracer').mockReturnValue({ trace });

    tracer.sendMessageTracer.start(localMessageId);

    expect(tracer.createTracer).toHaveBeenCalledWith(
      SlardarEvents.SDK_MESSAGE_SEND_TRACER,
    );
    expect(trace).toHaveBeenCalledWith('start', { meta: undefined });
  });

  it('sendMessageTracer success should call trace success and delete the tracer', () => {
    const localMessageId = '123';
    const trace = vi.fn();
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');

    tracer.sendMessageTracer.success(localMessageId);

    expect(trace).toHaveBeenCalledWith('success', { meta: undefined });
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_MESSAGE_SEND_TRACER,
    );
  });

  it('sendMessageTracer error should call trace error and delete the tracer', () => {
    const localMessageId = '123';
    const trace = vi.fn();
    const chatCoreError = {
      ext: { local_message_id: localMessageId },
      flatten: vi.fn().mockReturnValue({}),
    } as unknown as ChatCoreError;
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');

    tracer.sendMessageTracer.error(chatCoreError);

    expect(trace).toHaveBeenCalledWith('error', {
      meta: {},
      error: chatCoreError,
    });
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_MESSAGE_SEND_TRACER,
    );
  });

  it('sendMessageTracer error without local_message_id should do nothing', () => {
    const chatCoreError = {
      ext: {
        local_message_id: undefined,
      },
      flatten: vi.fn().mockReturnValue({
        local_message_id: undefined,
      }),
    } as unknown as ChatCoreError;
    tracer.sendMessageTracer.error(chatCoreError);
    const mockTracer = vi.spyOn(tracer, 'getTracer');
    const mockDeleteTracer = vi.spyOn(tracer, 'deleteTracer');
    expect(mockTracer).not.toHaveBeenCalled();
    expect(mockDeleteTracer).not.toHaveBeenCalled();
  });

  it('sendMessageTracer timeout should call trace timeout and delete the tracer', () => {
    const localMessageId = '123';
    const trace = vi.fn();
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');

    tracer.sendMessageTracer.timeout(localMessageId);

    expect(trace).toHaveBeenCalledWith('timeout');
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_MESSAGE_SEND_TRACER,
    );
  });

  it('pullStreamTracer start should create a tracer and call trace start', () => {
    const localMessageId = '456';
    const trace = vi.fn();
    vi.spyOn(tracer, 'createTracer').mockReturnValue({ trace });

    tracer.pullStreamTracer.start(localMessageId);

    expect(tracer.createTracer).toHaveBeenCalledWith(
      SlardarEvents.SDK_PULL_STREAM_TRACER,
    );
    expect(trace).toHaveBeenCalledWith('start', { meta: undefined });
  });

  it('pullStreamTracer success should call trace success and delete the tracer', () => {
    const localMessageId = '456';
    const trace = vi.fn();
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');

    tracer.pullStreamTracer.success(localMessageId);

    expect(trace).toHaveBeenCalledWith('success', { meta: undefined });
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_PULL_STREAM_TRACER,
    );
  });

  it('pullStreamTracer error should call trace error and delete the tracer', () => {
    const localMessageId = '456';
    const trace = vi.fn();
    const chatCoreError = {
      ext: { local_message_id: localMessageId },
      flatten: vi.fn().mockReturnValue({}),
    } as unknown as ChatCoreError;
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');

    tracer.pullStreamTracer.error(chatCoreError);

    expect(trace).toHaveBeenCalledWith('error', {
      meta: {},
      error: chatCoreError,
    });
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_PULL_STREAM_TRACER,
    );
  });

  it('pullStreamTracer break should call trace break and delete the tracer', () => {
    const localMessageId = '456';
    const trace = vi.fn();
    vi.spyOn(tracer, 'getTracer').mockReturnValue({ trace });
    vi.spyOn(tracer, 'deleteTracer');
    tracer.pullStreamTracer.break(localMessageId);
    expect(trace).toHaveBeenCalledWith('success', { meta: undefined });
    expect(tracer.deleteTracer).toHaveBeenCalledWith(
      localMessageId,
      SlardarEvents.SDK_PULL_STREAM_TRACER,
    );
  });

  it('pullStreamTracer error without local_message_id will do nothing', () => {
    const chatCoreError = {
      ext: {
        local_message_id: undefined,
      },
      flatten: vi.fn().mockReturnValue({
        local_message_id: undefined,
      }),
    } as unknown as ChatCoreError;
    tracer.pullStreamTracer.error(chatCoreError);
    const mockTracer = vi.spyOn(tracer, 'getTracer');
    const mockDeleteTracer = vi.spyOn(tracer, 'deleteTracer');
    expect(mockTracer).not.toHaveBeenCalled();
    expect(mockDeleteTracer).not.toHaveBeenCalled();
  });
});
