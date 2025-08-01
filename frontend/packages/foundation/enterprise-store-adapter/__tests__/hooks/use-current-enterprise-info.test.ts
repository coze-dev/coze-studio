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
import { Level } from '@coze-arch/bot-api/pat_permission_api';

import { useEnterpriseStore } from '../../src/stores/enterprise';
import {
  useCurrentEnterpriseInfo,
  useCurrentEnterpriseId,
  useIsCurrentPersonalEnterprise,
  useCurrentEnterpriseRoles,
  useIsEnterpriseLevel,
  useIsTeamLevel,
  useIsCurrentEnterpriseInit,
} from '../../src/hooks/use-current-enterprise-info';
import { PERSONAL_ENTERPRISE_ID } from '../../src/constants';

// Mock the enterprise store
vi.mock('../../src/stores/enterprise', () => ({
  useEnterpriseStore: vi.fn(),
}));

describe('useCurrentEnterpriseInfo and related hooks', () => {
  const mockCurrentEnterprise = {
    id: 'enterprise-1',
    name: 'Enterprise 1',
    enterprise_role_type_list: ['admin'],
    level: Level.enterprise,
    default_organization_id: 'org-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEnterpriseStore as any).mockImplementation((selector: any) =>
      selector({
        currentEnterprise: mockCurrentEnterprise,
        enterpriseId: mockCurrentEnterprise.id,
        isInit: true,
      }),
    );
  });

  describe('useCurrentEnterpriseInfo', () => {
    it('should return null for personal enterprise', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          enterpriseId: PERSONAL_ENTERPRISE_ID,
          currentEnterprise: null,
        }),
      );

      const { result } = renderHook(() => useCurrentEnterpriseInfo());

      expect(result.current).toBeNull();
    });

    it('should return null when enterprise is null', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          enterpriseId: 'enterprise-1',
          currentEnterprise: null,
        }),
      );

      const { result } = renderHook(() => useCurrentEnterpriseInfo());

      expect(result.current).toBeNull();
    });
  });

  describe('useCurrentEnterpriseId', () => {
    it('should return current enterprise id', () => {
      const { result } = renderHook(() => useCurrentEnterpriseId());

      expect(result.current).toBe(mockCurrentEnterprise.id);
    });
  });

  describe('useIsCurrentPersonalEnterprise', () => {
    it('should return true for personal enterprise', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          enterpriseId: PERSONAL_ENTERPRISE_ID,
        }),
      );

      const { result } = renderHook(() => useIsCurrentPersonalEnterprise());

      expect(result.current).toBe(true);
    });

    it('should return true for ersonal enterprise', () => {
      const { result } = renderHook(() => useIsCurrentPersonalEnterprise());

      expect(result.current).toBe(true);
    });
  });

  describe('useCurrentEnterpriseRoles', () => {
    it('should return empty array for personal enterprise', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          enterpriseId: PERSONAL_ENTERPRISE_ID,
          currentEnterprise: null,
        }),
      );

      const { result } = renderHook(() => useCurrentEnterpriseRoles());

      expect(result.current).toEqual([]);
    });

    it('should return empty array when enterprise roles are undefined', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          enterpriseId: 'enterprise-1',
          currentEnterprise: {
            ...mockCurrentEnterprise,
            enterprise_role_type_list: undefined,
          },
        }),
      );

      const { result } = renderHook(() => useCurrentEnterpriseRoles());

      expect(result.current).toEqual([]);
    });
  });

  describe('useIsEnterpriseLevel', () => {
    it('should return false for non-enterprise level', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          currentEnterprise: { ...mockCurrentEnterprise, level: Level.team },
        }),
      );

      const { result } = renderHook(() => useIsEnterpriseLevel());

      expect(result.current).toBe(false);
    });

    it('should return false when enterprise info is null', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          currentEnterprise: null,
        }),
      );

      const { result } = renderHook(() => useIsEnterpriseLevel());

      expect(result.current).toBe(false);
    });
  });

  describe('useIsTeamLevel', () => {
    it('should return false for non-team level', () => {
      const { result } = renderHook(() => useIsTeamLevel());

      expect(result.current).toBe(false);
    });

    it('should return false when enterprise info is null', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          currentEnterprise: null,
        }),
      );

      const { result } = renderHook(() => useIsTeamLevel());

      expect(result.current).toBe(false);
    });
  });

  describe('useIsCurrentEnterpriseInit', () => {
    it('should return false when enterprise is not initialized', () => {
      (useEnterpriseStore as any).mockImplementation((selector: any) =>
        selector({
          isCurrentEnterpriseInit: false,
        }),
      );

      const { result } = renderHook(() => useIsCurrentEnterpriseInit());

      expect(result.current).toBe(false);
    });
  });
});
