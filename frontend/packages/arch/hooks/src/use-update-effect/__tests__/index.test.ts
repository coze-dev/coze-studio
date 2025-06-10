import { renderHook } from '@testing-library/react-hooks';
import useUpdateEffect from '../index';

describe('useUpdateEffect', () => {
  it('test on mounted', () => {
    let mountedState = 1;
    const hook = renderHook(() =>
      useUpdateEffect(() => {
        mountedState = 2;
      }),
    );
    expect(mountedState).toEqual(1);
    hook.rerender();
    expect(mountedState).toEqual(2);
  });

  it('test on optional', () => {
    let mountedState = 1;
    const hook = renderHook(() =>
      useUpdateEffect(() => {
        mountedState = 3;
      }, [mountedState]),
    );
    expect(mountedState).toEqual(1);
    mountedState = 2;
    hook.rerender();
    expect(mountedState).toEqual(3);
  });
});
