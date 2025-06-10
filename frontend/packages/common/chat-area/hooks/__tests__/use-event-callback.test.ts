import { useRef, useState } from 'react';

import { expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';

import { useEventCallback } from '../src/hooks/use-event-callback';

it('get a fixed reference', () => {
  const print = vi.fn();
  const { result } = renderHook(() => {
    const [count, setCount] = useState(0);
    const fn = useEventCallback(print);
    const fnRef = useRef(fn);
    const isSame = fnRef.current === fn;
    const update = setCount;
    fn(count);
    return {
      isSame,
      update,
    };
  });

  act(() => {
    result.current.update(100);
  });
  expect(result.current.isSame).toBe(true);
  expect(print.mock.calls.length).toBe(2);
  expect(print.mock.calls[1][0]).toBe(100);

  act(() => {
    result.current.update(200);
  });
  expect(result.current.isSame).toBe(true);
  expect(print.mock.calls.length).toBe(3);
  expect(print.mock.calls[2][0]).toBe(200);
});
