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

import { LogLevel, LogAction } from '../src/types';
import {
  getColorByLogLevel,
  ConsoleLogClient,
} from '../src/logger/console-client';

describe('console client test cases', () => {
  test('getColorByLogLevel', () => {
    expect(getColorByLogLevel(LogLevel.SUCCESS)).toBe('#00CC00');
    expect(getColorByLogLevel(LogLevel.WARNING)).toBe('#CC9900');
    expect(getColorByLogLevel(LogLevel.ERROR)).toBe('#CC3333');
    expect(getColorByLogLevel(LogLevel.FATAL)).toBe('#FF0000');
    expect(getColorByLogLevel(LogLevel.INFO)).toBe('#0099CC');
  });
  test('ConsoleLogClient', () => {
    const client = new ConsoleLogClient();
    const logSpy = vi.spyOn(console, 'log');
    expect(
      client.send({
        meta: {},
      }),
    ).toBeUndefined();
    client.send({
      meta: {},
      action: [LogAction.CONSOLE],
      message: 'test',
    });
    expect(logSpy).toHaveBeenCalled();

    client.send({
      action: [LogAction.CONSOLE],
      eventName: 'test',
      scope: 'test scope',
    });
    expect(logSpy).toHaveBeenCalledTimes(2);
  });
});
