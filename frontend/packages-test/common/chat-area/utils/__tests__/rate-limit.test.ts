import { expect, it, vi } from 'vitest';

import { RateLimit } from '../src/rate-limit';

it('limit rate', async () => {
  vi.useFakeTimers();
  const request = vi.fn();
  const limiter = new RateLimit(request, {
    limit: 3,
    onLimitDelay: 1000,
    timeWindow: 5000,
  });
  for (const i of [1, 2, 3, 4, 5]) {
    limiter.invoke(i);
  }
  expect(request.mock.calls.length).toBe(3);
  // 1000
  await vi.advanceTimersByTimeAsync(1000);
  expect(request.mock.calls.length).toBe(4);
  // 2000
  await vi.advanceTimersByTimeAsync(1000);
  expect(request.mock.calls.length).toBe(5);
  // 3000
  await vi.advanceTimersByTimeAsync(1000);
  limiter.invoke();
  limiter.invoke();
  // 3010
  await vi.advanceTimersByTimeAsync(10);
  expect(request.mock.calls.length).toBe(6);
  // 4010
  await vi.advanceTimersByTimeAsync(1000);
  expect(request.mock.calls.length).toBe(7);

  // 离开窗口
  await vi.advanceTimersByTimeAsync(5000);
  limiter.invoke();
  limiter.invoke();
  limiter.invoke();
  expect(request.mock.calls.length).toBe(10);
  // 进入限流
  limiter.invoke();
  await vi.advanceTimersByTimeAsync(100);
  expect(request.mock.calls.length).toBe(10);
  expect((limiter as unknown as { records: number[] }).records.length).toBe(4);
  vi.useRealTimers();
});
