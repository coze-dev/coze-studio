import React from 'react';

import { renderHook, act } from '@testing-library/react-hooks';

import { useBackgroundScroll } from '../../src/hooks/uikit/use-background-scroll';

vi.mock('../../src/hooks/public/use-show-bgackground', () => ({
  useShowBackGround: () => true,
}));
describe('useBackgroundScroll', () => {
  it('should update showGradient state correctly', () => {
    const maskNode = React.createElement('div');
    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        styles: { a: 'ss' },
        maskNode,
      }),
    );

    expect(result.current.showGradient).toBe(true);

    act(() => {
      result.current.onReachTop();
    });

    expect(result.current.showGradient).toBe(false);
    expect(result.current.beforeNode).toBe(null);

    act(() => {
      result.current.onLeaveTop();
    });

    expect(result.current.showGradient).toBe(true);
    expect(result.current.beforeNode).toBe(maskNode);
  });

  it('should update beforeClassName correctly', () => {
    const maskNode = React.createElement('div');

    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        maskNode,
        styles: { 'scroll-mask': 'mask-class' },
      }),
    );

    expect(result.current.beforeClassName).toBe('absolute left-0');
  });

  it('should update maskClass correctly', () => {
    const maskNode = React.createElement('div');

    const { result } = renderHook(() =>
      useBackgroundScroll({
        hasHeaderNode: true,
        maskNode,
        styles: { 'scroll-mask': 'mask-class' },
      }),
    );

    expect(result.current.maskClassName).toBe('mask-class');
  });
});
