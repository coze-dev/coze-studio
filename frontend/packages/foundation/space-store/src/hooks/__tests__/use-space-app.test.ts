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

import { useLocation } from 'react-router-dom';

import { renderHook } from '@testing-library/react-hooks';

import { useSpaceApp } from '../use-space-app';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
}));

describe('useSpaceApp', () => {
  it('should return subpathName as spaceApp when url pattern matches', () => {
    const mockLocationArr = [
      ['/space/123/app1', 'app1'],
      ['/space/123/app2/123', 'app2'],
    ];
    mockLocationArr.forEach(([pathname, spaceApp]) => {
      vi.mocked(useLocation).mockReturnValueOnce({ pathname } as any);
      const { result } = renderHook(() => useSpaceApp());
      expect(result.current).toEqual(spaceApp);
    });
  });
  it('should return undefined when url pattern not matches', () => {
    vi.mocked(useLocation).mockReturnValueOnce({ pathname: '/space' } as any);
    const { result } = renderHook(() => useSpaceApp());
    expect(result.current).toEqual(undefined);
  });
});
