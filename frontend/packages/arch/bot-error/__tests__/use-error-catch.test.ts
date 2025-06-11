import { type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
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
vi.stubGlobal('window', {
  addEventListener: vi.fn((e: string, cb: (event: unknown) => void) => {
    if (e === 'unhandledrejection') {
      cb({
        promise: Promise.reject(new Error()),
      });
    }
  }),
  removeEventListener: vi.fn(),
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
    expect(window.addEventListener).toHaveBeenCalled();
    expect(window.removeEventListener).toHaveBeenCalled();
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
