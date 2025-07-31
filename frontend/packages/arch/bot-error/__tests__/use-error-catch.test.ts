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
import { renderHook } from '@testing-library/react';
import { type SlardarInstance } from '@coze-arch/logger';

import { useErrorCatch } from '../src/use-error-catch';
import { isCertainError, sendCertainError } from '../src/certain-error';
import { CustomError } from '../src';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    createLoggerWith: vi.fn(() => ({
      info: vi.fn(),
      persist: {
        error: vi.fn(),
      },
    })),
  },
}));

// Mock window event listeners without overriding the entire window object
const mockAddEventListener = vi.fn(
  (e: string, cb: (event: unknown) => void) => {
    if (e === 'unhandledrejection') {
      cb({
        promise: Promise.reject(new Error()),
      });
    }
  },
);
const mockRemoveEventListener = vi.fn();

// Spy on and mock the window methods instead of replacing the entire window
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true,
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true,
});

vi.mock('../src/certain-error');

describe('use-error-catch', () => {
  test('Should handle promise rejection correctly', () => {
    const slardarInstance = {
      on: vi.fn(),
      off: vi.fn(),
    };

    // Mock normal error
    (isCertainError as Mock).mockReturnValue(false);
    slardarInstance.on.mockImplementationOnce(
      (_: string, cb: (e: { payload: { error: Error } }) => void) => {
        cb({ payload: { error: new Error() } });
      },
    );
    const { unmount } = renderHook(() =>
      useErrorCatch(slardarInstance as unknown as SlardarInstance),
    );
    unmount();
    expect(mockAddEventListener).toHaveBeenCalled();
    expect(mockRemoveEventListener).toHaveBeenCalled();
    expect(slardarInstance.on).toHaveBeenCalled();
    expect(slardarInstance.off).toHaveBeenCalled();
    expect(sendCertainError).not.toHaveBeenCalled();

    // Mock certain error
    (isCertainError as Mock).mockReturnValue(true);
    slardarInstance.on.mockImplementationOnce(
      (_: string, cb: (e: { payload: { error: Error } }) => void) => {
        const error = new CustomError('test', 'test');
        error.name = 'CustomError';
        cb({ payload: { error } });
      },
    );
    renderHook(() =>
      useErrorCatch(slardarInstance as unknown as SlardarInstance),
    );
    unmount();
    expect(sendCertainError).toHaveBeenCalled();
  });
});
