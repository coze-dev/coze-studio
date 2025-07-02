import { describe, expect, vi } from 'vitest';

import { Deferred, sleep } from '../src/async';

it('sleep', async () => {
  vi.useFakeTimers();
  let count = 0;
  sleep(1000).then(() => (count = 1));
  vi.runAllTimers();
  expect(count).toBe(0);
  await Promise.resolve();
  expect(count).toBe(1);
});

describe('test deferred', () => {
  it('works', async () => {
    const deferred = new Deferred<number>();
    deferred.resolve(1);
    expect(await deferred.promise).toBe(1);
  });

  it('reject', async () => {
    const deferred = new Deferred();
    deferred.reject(123);
    try {
      await deferred.promise;
    } catch (err) {
      expect(err).toBe(123);
    }
  });

  it('perform like promise', async () => {
    const deferred = new Deferred<string>();
    deferred.resolve('1');
    expect(await deferred).toBe('1');
  });
});
