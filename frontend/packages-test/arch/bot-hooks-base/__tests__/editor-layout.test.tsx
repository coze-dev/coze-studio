import { type PropsWithChildren } from 'react';

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

import {
  useLayoutContext,
  LayoutContext,
  PlacementEnum,
} from '../src/editor-layout';

describe('editor-layout', () => {
  const wrapper = ({
    children,
    placement = PlacementEnum.CENTER,
  }: PropsWithChildren<{ placement?: PlacementEnum }>) => (
    <LayoutContext value={{ placement }}>{children}</LayoutContext>
  );

  it('should use default center placement', () => {
    const { result } = renderHook(() => useLayoutContext());
    expect(result.current.placement).toBe(PlacementEnum.CENTER);
  });

  it('should use provided placement', () => {
    const { result } = renderHook(() => useLayoutContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, placement: PlacementEnum.LEFT }),
    });
    expect(result.current.placement).toBe(PlacementEnum.LEFT);
  });

  it('should use right placement', () => {
    const { result } = renderHook(() => useLayoutContext(), {
      wrapper: ({ children }) =>
        wrapper({ children, placement: PlacementEnum.RIGHT }),
    });
    expect(result.current.placement).toBe(PlacementEnum.RIGHT);
  });
});
