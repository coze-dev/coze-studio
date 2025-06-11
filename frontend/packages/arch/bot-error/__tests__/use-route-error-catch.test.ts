import { renderHook } from '@testing-library/react-hooks';

import { sendCertainError } from '../src/certain-error';
import { CustomError, useRouteErrorCatch } from '../src';

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
vi.mock('../src/custom-error');
vi.mock('../src/certain-error');

describe('useRouteErrorCatch', () => {
  test('Should handle route error correctly', () => {
    // normal error
    renderHook(() => useRouteErrorCatch(new Error()));
    expect(sendCertainError).toHaveBeenCalled();

    // custom error
    renderHook(() => useRouteErrorCatch(new CustomError('test', 'test')));
    expect(sendCertainError).toHaveBeenCalled();
  });
});
