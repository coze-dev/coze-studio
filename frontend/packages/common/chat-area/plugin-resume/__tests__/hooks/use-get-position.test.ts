/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { renderHook, act } from '@testing-library/react-hooks';

import { useGetPosition } from '../../src/hooks/use-get-position';

vi.mock('@coze-arch/coze-design', () => ({
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
