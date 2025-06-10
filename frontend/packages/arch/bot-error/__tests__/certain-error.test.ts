import { type Mock } from 'vitest';
import { isAxiosError } from 'axios';
import { isApiError } from '@coze-arch/bot-http';

import {
  getErrorName,
  isCertainError,
  sendCertainError,
} from '../src/certain-error';
import { isCustomError, isChunkError } from '../src';

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
  reporter: {
    errorEvent: vi.fn(),
    info: vi.fn(),
  },
}));
vi.mock('axios', async () => {
  const actual: Record<string, unknown> = await vi.importActual('axios');
  return {
    ...actual,
    isAxiosError: vi.fn(),
  };
});
vi.mock('@coze-arch/bot-http', () => ({
  isApiError: vi.fn(),
}));
vi.mock('../src/custom-error', () => ({
  isCustomError: vi.fn(),
}));
vi.mock('../src/source-error', () => ({
  isChunkError: vi.fn(),
}));
const isNoInstanceError = vi.fn();
const errorFuncList = [
  {
    func: isCustomError,
    name: 'CustomError',
  },
  {
    func: isAxiosError,
    name: 'AxiosError',
  },
  {
    func: isApiError,
    name: 'ApiError',
  },
  {
    func: isChunkError,
    name: 'ChunkLoadError',
  },
  {
    func: isNoInstanceError,
    name: 'notInstanceError',
  },
];

describe('bot-error-certain-error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getErrorName', () => {
    const resNull = getErrorName(null);
    expect(resNull).equal('unknown');
    errorFuncList.forEach(item => {
      const { func } = item;
      (func as Mock).mockReturnValueOnce(true);
      const error = item.name === 'notInstanceError' ? {} : new Error();
      const res = getErrorName(error as Error);
      expect(res).equal(item.name);
    });
  });

  test('isCertainError', () => {
    errorFuncList.forEach(item => {
      const { func } = item;
      (func as Mock).mockReturnValueOnce(true);
      const error = item.name === 'notInstanceError' ? {} : new Error();
      const res = isCertainError(error as Error);
      expect(res).equal(true);
    });
  });

  test('sendCertainError', () => {
    errorFuncList.forEach(item => {
      const handle = vi.fn();
      (item.func as Mock).mockReturnValue(true);
      const error = item.name === 'notInstanceError' ? {} : new Error();
      sendCertainError(error as Error, handle);
      expect(handle).not.toHaveBeenCalled();
      (item.func as Mock).mockReturnValue(false);
      sendCertainError(new Error(), handle);
      expect(handle).toHaveBeenCalled();
    });
    // notInstanceError json stringify 失败的单测
    errorFuncList.forEach(item => {
      const handle = vi.fn();
      if (item.name !== 'notInstanceError') {
        return;
      }
      (item.func as Mock).mockReturnValue(true);
      // JSON stringify 会报错的 case
      const b = { a: {} };
      const a = { b: {}, name: 'notInstanceError' };
      b.a = a;
      a.b = b;
      const error = item.name === 'notInstanceError' ? a : new Error();
      sendCertainError(error as Error, handle);
      expect(handle).not.toHaveBeenCalled();
    });
  });
});
