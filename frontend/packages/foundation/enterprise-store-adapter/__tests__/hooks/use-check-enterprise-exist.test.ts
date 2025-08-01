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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';

import { useEnterpriseStore } from '../../src/stores/enterprise';
import { useCheckEnterpriseExist } from '../../src/hooks/use-check-enterprise-exist';

// Mock the enterprise store
vi.mock('../../src/stores/enterprise', () => ({
  useEnterpriseStore: vi.fn(),
}));

describe('useCheckEnterpriseExist', () => {
  const mockIsEnterpriseExist = true;

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        isEnterpriseExist: mockIsEnterpriseExist,
      }),
    );
  });

  it('should return enterprise exist status and check function', () => {
    const { result } = renderHook(() => useCheckEnterpriseExist());

    expect(result.current).toEqual({
      checkEnterpriseExist: expect.any(Function),
      checkEnterpriseExistLoading: false,
      isEnterpriseExist: mockIsEnterpriseExist,
    });
  });

  it('should return false when enterprise does not exist', () => {
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        isEnterpriseExist: false,
      }),
    );

    const { result } = renderHook(() => useCheckEnterpriseExist());

    expect(result.current.isEnterpriseExist).toBe(false);
  });
});
