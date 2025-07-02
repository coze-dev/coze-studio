import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useComponentState } from '../src/use-component-state';

describe('useComponentState', () => {
  it('should initialize with the provided state', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    expect(result.current.state).toEqual(initialState);
  });

  it('should perform incremental updates by default', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1 });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'hello' });
  });

  it('should replace entire state when replace flag is true', () => {
    const initialState = { count: 0, text: 'hello', extra: true };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1, text: 'hello', extra: true }, true);
    });

    expect(result.current.state).toEqual({
      count: 1,
      text: 'hello',
      extra: true,
    });
  });

  it('should reset state to initial value', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1, text: 'world' });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'world' });

    act(() => {
      result.current.resetState();
    });

    expect(result.current.state).toEqual(initialState);
  });

  it('should handle multiple updates', () => {
    const initialState = { count: 0, text: 'hello' };
    const { result } = renderHook(() => useComponentState(initialState));

    act(() => {
      result.current.setState({ count: 1 });
      result.current.setState({ text: 'world' });
    });

    expect(result.current.state).toEqual({ count: 1, text: 'world' });
  });
});
