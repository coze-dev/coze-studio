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
