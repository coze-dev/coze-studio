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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { reporter } from '@coze-arch/logger';
import { workflowApi } from '@coze-arch/bot-api';

import { useSpaceGrayStore, TccKey } from '../../src/space-gray';

// simulated global variable
vi.stubGlobal('IS_DEV_MODE', false);
vi.stubGlobal('IS_BOT_OP', false);

// simulated dependency
vi.mock('@coze-arch/logger', () => ({
  reporter: {
    error: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  workflowApi: {
    GetWorkflowGrayFeature: vi.fn(),
    OPGetWorkflowGrayFeature: vi.fn(),
  },
}));

describe('space-gray', () => {
  const mockSpaceId = 'test-space-id';
  const mockFeatureItems = [
    {
      feature: TccKey.ImageGenerateConverter,
      in_gray: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    act(() => {
      useSpaceGrayStore.setState({
        spaceId: '',
        grayFeatureItems: [],
      });
    });

    // Simulate API response
    (workflowApi.GetWorkflowGrayFeature as any).mockResolvedValue({
      data: mockFeatureItems,
    });

    (workflowApi.OPGetWorkflowGrayFeature as any).mockResolvedValue({
      data: mockFeatureItems,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('TccKey', () => {
    it('应该定义 ImageGenerateConverter 常量', () => {
      expect(TccKey.ImageGenerateConverter).toBe('ImageGenerateConverter');
    });
  });

  describe('useSpaceGrayStore', () => {
    it('应该初始化为空状态', () => {
      const { result } = renderHook(() => useSpaceGrayStore());

      expect(result.current.spaceId).toBe('');
      expect(result.current.grayFeatureItems).toEqual([]);
    });

    describe('load', () => {
      it('应该调用 GetWorkflowGrayFeature API 并更新状态', async () => {
        const { result } = renderHook(() => useSpaceGrayStore());

        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        expect(workflowApi.GetWorkflowGrayFeature).toHaveBeenCalledWith({
          space_id: mockSpaceId,
        });

        expect(result.current.spaceId).toBe(mockSpaceId);
        expect(result.current.grayFeatureItems).toEqual(mockFeatureItems);
      });

      it('当 IS_BOT_OP 为 true 时应该调用 OPGetWorkflowGrayFeature API', async () => {
        // Set IS_BOT_OP to true
        vi.stubGlobal('IS_BOT_OP', true);

        const { result } = renderHook(() => useSpaceGrayStore());

        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        expect(workflowApi.OPGetWorkflowGrayFeature).toHaveBeenCalledWith({
          space_id: mockSpaceId,
        });

        expect(result.current.spaceId).toBe(mockSpaceId);
        expect(result.current.grayFeatureItems).toEqual(mockFeatureItems);

        // Restore IS_BOT_OP to false
        vi.stubGlobal('IS_BOT_OP', false);
      });

      it('当 spaceId 与缓存的相同时不应该调用 API', async () => {
        const { result } = renderHook(() => useSpaceGrayStore());

        // Load once first
        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        // Clear previous call history
        vi.clearAllMocks();

        // Load the same spaceId again.
        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        expect(workflowApi.GetWorkflowGrayFeature).not.toHaveBeenCalled();
      });

      it('当 API 调用失败时应该记录错误', async () => {
        const mockError = new Error('API error');
        (workflowApi.GetWorkflowGrayFeature as any).mockRejectedValue(
          mockError,
        );

        const { result } = renderHook(() => useSpaceGrayStore());

        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        expect(reporter.error).toHaveBeenCalledWith({
          message: 'workflow_prefetch_tcc_fail',
          namespace: 'workflow',
          error: mockError,
        });
      });
    });

    describe('isHitSpaceGray', () => {
      it('当特性在灰度列表中且 in_gray 为 true 时应该返回 true', async () => {
        const { result } = renderHook(() => useSpaceGrayStore());

        // Load grey release feature first
        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        const isHit = result.current.isHitSpaceGray(
          TccKey.ImageGenerateConverter,
        );

        expect(isHit).toBe(true);
      });

      it('当特性在灰度列表中但 in_gray 为 false 时应该返回 false', async () => {
        const mockFeatureItemsWithFalse = [
          {
            feature: TccKey.ImageGenerateConverter,
            in_gray: false,
          },
        ];

        (workflowApi.GetWorkflowGrayFeature as any).mockResolvedValue({
          data: mockFeatureItemsWithFalse,
        });

        const { result } = renderHook(() => useSpaceGrayStore());

        // Load grey release feature first
        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        const isHit = result.current.isHitSpaceGray(
          TccKey.ImageGenerateConverter,
        );

        expect(isHit).toBe(false);
      });

      it('当特性不在灰度列表中时应该返回 false', async () => {
        const { result } = renderHook(() => useSpaceGrayStore());

        // Load grey release feature first
        await act(async () => {
          await result.current.load(mockSpaceId);
        });

        // Use a non-existent key
        const isHit = result.current.isHitSpaceGray('NonExistentKey' as TccKey);

        expect(isHit).toBe(false);
      });

      it('当灰度列表为空时应该返回 false', () => {
        const { result } = renderHook(() => useSpaceGrayStore());

        const isHit = result.current.isHitSpaceGray(
          TccKey.ImageGenerateConverter,
        );

        expect(isHit).toBe(false);
      });
    });
  });
});
