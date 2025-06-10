import { renderHook, act } from '@testing-library/react-hooks';

import { useGetPosition } from '../../src/hooks/use-get-position';

vi.mock('@coze/coze-design', () => ({
  Toast: {
    error: vi.fn(),
  },
}));

const mockPosition = {
  coords: {
    latitude: 10,
    longitude: 20,
  },
};

const mockGetPositionSuccess = vi.fn();

describe('useGetPosition', () => {
  it('should set loading to true when getSysPosition is called', () => {
    const { result } = renderHook(() =>
      useGetPosition({ getPositionSuccess: vi.fn() }),
    );

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
      },
    });

    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.getSysPosition();
    });

    expect(result.current.loading).toBe(true);
  });

  it('should call getPositionSuccess with the position when geolocation is available', () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(successCallback => {
          successCallback(mockPosition);
        }),
      },
    });

    const { result } = renderHook(() =>
      useGetPosition({ getPositionSuccess: mockGetPositionSuccess }),
    );

    act(() => {
      result.current.getSysPosition();
    });

    expect(result.current.loading).toBe(false);
    expect(mockGetPositionSuccess).toHaveBeenCalledWith(mockPosition);
  });
});
