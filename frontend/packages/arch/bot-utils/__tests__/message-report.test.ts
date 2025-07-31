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

import { createReportEvent } from '@coze-arch/report-events';

import { messageReportEvent } from '../src/message-report';

const TEST_LOG_ID = 'test_log_id';
const TEST_BOT_ID = 'test_bot_id';

vi.mock('@coze-arch/web-context', () => ({
  globalVars: {
    LAST_EXECUTE_ID: 'test_log_id',
  },
}));
const mockAddDurationPoint = vi.fn();
const mockSuccess = vi.fn();
const mockError = vi.fn();
vi.mock('@coze-arch/report-events', async () => {
  const actual: Record<string, unknown> = await vi.importActual(
    '@coze-arch/report-events',
  );
  return {
    ...actual,
    createReportEvent: vi.fn(() => ({
      addDurationPoint: mockAddDurationPoint,
      success: mockSuccess,
      error: mockError,
    })),
  };
});
vi.mock('@coze-arch/logger', () => ({
  reporter: vi.fn(),
}));
vi.mock('@coze-arch/bot-error', () => ({}));

describe('message-report', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Should setup correctly', () => {
    const { log_id } = messageReportEvent.getLogID();
    expect(log_id).equal(TEST_LOG_ID);

    messageReportEvent.start(TEST_BOT_ID);
    const { bot_id, log_id: logId } = messageReportEvent.getMetaCtx();
    expect(bot_id).equal(TEST_BOT_ID);
    expect(logId).equal(TEST_LOG_ID);
  });

  /// messageReceiveSuggestsEvent & receiveMessageEvent
  test('messageReceiveSuggestsEvent & receiveMessageEvent should not trigger report event if `start` has not been called', () => {
    [
      messageReportEvent.messageReceiveSuggestsEvent,
      messageReportEvent.receiveMessageEvent,
    ].forEach(event => {
      event.success();
      event.finish('' as any);
      event.error({
        error: new Error(),
        reason: '',
      });
      if (event === messageReportEvent.receiveMessageEvent) {
        event.receiveMessage({ message_id: '' });
      }
      expect(createReportEvent).not.toHaveBeenCalled();
      expect(mockAddDurationPoint).not.toHaveBeenCalled();
    });
  });

  test('messageReceiveSuggestsEvent & receiveMessageEvent should trigger reporter correctly by calling `receiveSuggest`', () => {
    messageReportEvent.messageReceiveSuggestsEvent.start();
    messageReportEvent.messageReceiveSuggestsEvent.receiveSuggest();
    expect(createReportEvent).toHaveBeenCalled();
    expect(mockAddDurationPoint).toHaveBeenCalledWith('first');
  });

  test('`success` should trigger reporter correctly', () => {
    [
      messageReportEvent.messageReceiveSuggestsEvent,
      messageReportEvent.messageReceiveSuggestsEvent,
    ].forEach(event => {
      ['success', 'finish'].forEach(tag => {
        event.start();
        event[tag]();
        expect(createReportEvent).toHaveBeenCalled();
        expect(mockAddDurationPoint).toHaveBeenCalledWith('success');
        expect(mockSuccess).toHaveBeenCalled();
      });
    });
  });

  test('messageReceiveSuggestsEvent & receiveMessageEvent should trigger reporter correctly by calling `error`', () => {
    [
      messageReportEvent.messageReceiveSuggestsEvent,
      messageReportEvent.messageReceiveSuggestsEvent,
    ].forEach(event => {
      event.start();
      event.error({
        error: new Error(),
        reason: '',
      });
      expect(createReportEvent).toHaveBeenCalled();
      expect(mockAddDurationPoint).toHaveBeenCalledWith('failed');
      expect(mockError).toHaveBeenCalled();
    });
  });

  test('executeDraftBotEvent should report correctly by calling start', () => {
    const event = messageReportEvent.executeDraftBotEvent;

    event.start();
    event.success();
    expect(createReportEvent).toHaveBeenCalled();
    expect(mockAddDurationPoint).toHaveBeenCalledWith('finish');
    expect(mockSuccess).toHaveBeenCalled();
  });

  test('executeDraftBotEvent should report correctly by calling error', () => {
    const event = messageReportEvent.executeDraftBotEvent;

    event.start();
    event.error({ error: new Error(), reason: '' });
    expect(createReportEvent).toHaveBeenCalled();
    expect(mockError).toHaveBeenCalled();
  });

  test('interrupt', () => {
    [
      messageReportEvent.messageReceiveSuggestsEvent,
      messageReportEvent.messageReceiveSuggestsEvent,
    ].forEach((event, index) => {
      if (index === 0) {
        event.receiveSuggest();
      }
      event.start();
      messageReportEvent.interrupt();
      expect(mockSuccess).toHaveBeenCalled();
    });
  });
});
