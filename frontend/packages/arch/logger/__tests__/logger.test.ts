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

import { type Mock } from 'vitest';

import { Logger } from '../src/logger/logger';
import { shouldCloseConsole } from '../src/console-disable';
import { type SlardarInstance } from '../src';

vi.mock('../src/console-disable');
vi.stubGlobal('IS_RELEASE_VERSION', undefined);

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create another instance correctly', () => {
    const logger = new Logger();
    const anotherLogger = logger.createLoggerWith({});
    expect(anotherLogger).toBeInstanceOf(Logger);
  });

  test('should trigger disable-console when calling logger.xxx functions', () => {
    const logger = new Logger();
    logger.init({} as unknown as SlardarInstance);

    ['info', 'success', 'warning', 'error'].forEach(fnName => {
      logger[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(false);
    });

    logger.setup({ 'no-console': true });
    // create after setup should also inherit no-console
    const logger2 = logger.createLoggerWith({});
    ['info', 'success', 'warning', 'error'].forEach(fnName => {
      (shouldCloseConsole as Mock).mockReturnValue(true);
      logger[fnName]({ message: 'test' });
      logger2[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(true);
      expect(logger2.disableConsole).toBe(true);

      (shouldCloseConsole as Mock).mockReturnValue(false);
      logger[fnName]({ message: 'test' });
      logger2[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(false);
      expect(logger2.disableConsole).toBe(false);
    });
  });
});
