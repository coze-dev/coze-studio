import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { featureFlagStorage } from '../src/utils/storage';
import { useFlags } from '../src/use-flags'; // Adjust the import path
import { getFlags } from '../src/get-flags';

vi.mock('../src/utils/storage', () => ({
  featureFlagStorage: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock('../src/get-flags', () => ({
  getFlags: vi.fn(),
}));

describe('useFlags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return initial flags', () => {
    const initialFlags = { feature1: true, feature2: false };
    getFlags.mockImplementation(() => initialFlags);

    const { result } = renderHook(() => useFlags());

    expect(result.current[0]).toEqual(initialFlags);
  });

  it('should update flags on storage change', () => {
    const initialFlags = { feature1: true, feature2: false };
    const updatedFlags = { feature1: false, feature2: true };
    getFlags.mockImplementation(() => initialFlags);

    const { result } = renderHook(() => useFlags());

    act(() => {
      getFlags.mockImplementation(() => updatedFlags);
      featureFlagStorage.on.mock.calls[0][1](); // Simulate 'change' event
    });

    expect(result.current[0]).toEqual(updatedFlags);
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useFlags());

    unmount();

    expect(featureFlagStorage.off).toHaveBeenCalled();
  });
});
