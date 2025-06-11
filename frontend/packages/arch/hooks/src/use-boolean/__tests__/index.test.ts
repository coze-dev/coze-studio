import { renderHook, act } from '@testing-library/react-hooks';
import useBoolean from '../index';

describe('useBoolean', () => {
  it('uses methods', () => {
    const hook = renderHook(() => useBoolean());
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.setFalse();
    });
    expect(hook.result.current.state).toBeFalsy();

    act(() => {
      hook.result.current.toggle();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.setTrue();
    });
    expect(hook.result.current.state).toBeTruthy();

    act(() => {
      hook.result.current.toggle(true);
    });
    expect(hook.result.current.state).toBeTruthy();
  });

  it('uses defaultValue', () => {
    const hook = renderHook(() => useBoolean(true));
    expect(hook.result.current.state).toBeTruthy();
  });
});
