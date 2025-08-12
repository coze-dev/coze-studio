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

import { LogAction, LogLevel } from '../src/types';
import { SlardarReportClient } from '../src/slardar';
vi.mock('@slardar/web');

const captureException = vi.fn();
const sendEvent = vi.fn();
const sendLog = vi.fn();
const mockSlardarInstance = function (type) {
  if (type === 'captureException') {
    captureException();
  }

  if (type === 'sendEvent') {
    sendEvent();
  }

  if (type === 'sendLog') {
    sendLog();
  }
};
describe('slardar reporter client test cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('slardar init fail', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    new SlardarReportClient(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('slardar just report persist log', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    expect(
      slardarReportClient.send({
        action: [LogAction.CONSOLE],
      }),
    ).toBeUndefined();
  });

  test('slardar report error', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.ERROR,
      meta: {
        reportJsError: true,
      },
    });
    expect(captureException).toHaveBeenCalled();
  });

  test('slardar report event', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.INFO,
      eventName: 'test-event',
    });
    expect(sendEvent).toHaveBeenCalled();
  });

  test('slardar report log', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.INFO,
      message: 'test message',
    });
    expect(sendLog).toHaveBeenCalled();
  });
});
