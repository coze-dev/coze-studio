import { expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';

import { useImperativeLayoutEffect } from '../src/hooks/use-imperative-layout-effect';

it('run after layout effect', () => {
  const fn = vi.fn();
  const { result } = renderHook(() => useImperativeLayoutEffect(fn));
  expect(fn.mock.calls.length).toBe(0);
  act(() => {
    result.current(22);
    expect(fn.mock.calls.length).toBe(0);
  });
  expect(fn.mock.calls.length).toBe(1);
  expect(fn.mock.calls[0][0]).toBe(22);
});
