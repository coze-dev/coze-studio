import { expect, it, vi } from 'vitest';

import { safeAsyncThrow } from '../src/safe-async-throw';

it('throw in IS_DEV_MODE', () => {
  vi.stubGlobal('IS_PROD', true);
  vi.stubGlobal('IS_DEV_MODE', true);
  expect(() => safeAsyncThrow('1')).toThrow();
});

it('do not throw in BUILD env', () => {
  vi.stubGlobal('IS_DEV_MODE', false);
  vi.stubGlobal('IS_BOE', false);
  vi.stubGlobal('IS_PROD', true);
  vi.stubGlobal('window', {
    gfdatav1: {
      canary: 0,
    },
  });
  vi.useFakeTimers();
  safeAsyncThrow('1');
  try {
    vi.runAllTimers();
  } catch (e) {
    expect((e as Error).message).toBe('[chat-area] 1');
  }
  vi.useRealTimers();
});
