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

import { vi } from 'vitest';

const mockWriteLine = vi.fn();
vi.mock('@rushstack/node-core-library', () => ({
  Terminal: vi.fn().mockImplementation(() => ({ writeLine: mockWriteLine })),
  ConsoleTerminalProvider: vi.fn(),
  Colors: new Proxy(
    {},
    {
      get(_, color: string) {
        return () => color;
      },
    },
  ),
}));

describe('test log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('info log', async () => {
    const { logger } = await vi.importActual('../src');
    const info = vi.fn(logger.info.bind(logger));
    info('hello');
    expect(info).toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('hello');

    const success = vi.fn(logger.success.bind(logger));
    success('hello');
    expect(success).toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith('hello');

    logger.default('test');
    expect(mockWriteLine).toBeCalledWith('test');
  });

  it('debug log', async () => {
    const { logger } = await vi.importActual('../src');
    const debug = vi.fn(logger.debug.bind(logger));
    debug('hello');
    expect(debug).toHaveBeenCalled();
    expect(debug).toHaveBeenCalledWith('hello');
  });

  it('warning log', async () => {
    const { logger } = await vi.importActual('../src');
    const warning = vi.fn(logger.warning.bind(logger));
    warning('hello');
    expect(warning).toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('hello');
  });

  it('error log', async () => {
    const { logger } = await vi.importActual('../src');
    const error = vi.fn(logger.error.bind(logger));
    error('hello');
    expect(error).toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith('hello');
  });

  it('no prefix log', async () => {
    const { logger } = await vi.importActual('../src');
    const info = vi.fn(logger.info.bind(logger));
    info('no prefix info', false);
    expect(info).toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith('no prefix info', false);
  });

  it('turn on/off', async () => {
    const { logger } = await vi.importActual('../src');
    const info = vi.fn(logger.info.bind(logger));
    logger.turnOff();
    info('no prefix info', false);
    expect(mockWriteLine).not.toHaveBeenCalled();
    logger.turnOn();
    info('test', false);
    expect(mockWriteLine).toHaveBeenCalled();
  });
});
