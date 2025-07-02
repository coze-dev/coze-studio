import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useInitialValue } from '../src/use-initial-value';

describe('useInitialValue', () => {
  it('should return the initial value', () => {
    const initialValue = 'test';
    const { result } = renderHook(() => useInitialValue(initialValue));
    expect(result.current).toBe(initialValue);
  });

  it('should maintain the initial value even if input changes', () => {
    let value = 'initial';
    const { result, rerender } = renderHook(() => useInitialValue(value));
    expect(result.current).toBe('initial');

    value = 'changed';
    rerender();
    expect(result.current).toBe('initial');
  });

  it('should work with different types', () => {
    const numberValue = 42;
    const { result: numberResult } = renderHook(() =>
      useInitialValue(numberValue),
    );
    expect(numberResult.current).toBe(42);

    const objectValue = { key: 'value' };
    const { result: objectResult } = renderHook(() =>
      useInitialValue(objectValue),
    );
    expect(objectResult.current).toEqual({ key: 'value' });

    const arrayValue = [1, 2, 3];
    const { result: arrayResult } = renderHook(() =>
      useInitialValue(arrayValue),
    );
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });
});
