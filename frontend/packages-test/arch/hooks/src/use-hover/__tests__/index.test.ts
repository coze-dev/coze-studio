import { act, renderHook } from '@testing-library/react-hooks';

import useHover from '../index';

describe('useHover', () => {
  it('test div element ref', () => {
    const target = document.createElement('div');
    const handleEnter = vi.fn();
    const handleLeave = vi.fn();
    const hook = renderHook(() =>
      useHover(target, {
        onEnter: handleEnter,
        onLeave: handleLeave,
      }),
    );
    expect(hook.result.current[1]).toBe(false);

    act(() => {
      target.dispatchEvent(new Event('mouseenter'));
    });
    expect(hook.result.current[1]).toBe(true);
    expect(handleEnter).toBeCalledTimes(1);

    act(() => {
      target.dispatchEvent(new Event('mouseleave'));
    });
    expect(hook.result.current[1]).toBe(false);
    expect(handleLeave).toBeCalledTimes(1);
    hook.unmount();
  });
});
