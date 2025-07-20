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
 
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { SpaceRoleType } from '@coze-arch/idl/developer_api';

// 模拟全局变量
vi.stubGlobal('IS_DEV_MODE', true);

describe('Space Auth Store', () => {
  beforeEach(() => {
    // 重置模块缓存，确保每个测试都使用新的 store 实例
    vi.resetModules();
  });

  describe('setRoles', () => {
    it('应该正确设置空间角色', async () => {
      // 动态导入 store 模块，确保每次测试都获取新的实例
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      const roles = [SpaceRoleType.Owner, SpaceRoleType.Admin];
      await act(() => {
        result.current.setRoles('space1', roles);
      });

      expect(result.current.roles.space1).toEqual(roles);
    });

    it('应该能够为多个空间设置不同的角色', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      const roles1 = [SpaceRoleType.Owner];
      const roles2 = [SpaceRoleType.Member];

      await act(() => {
        result.current.setRoles('space1', roles1);
        result.current.setRoles('space2', roles2);
      });

      expect(result.current.roles.space1).toEqual(roles1);
      expect(result.current.roles.space2).toEqual(roles2);
    });

    it('应该能够更新已存在空间的角色', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      const initialRoles = [SpaceRoleType.Owner];
      const updatedRoles = [SpaceRoleType.Admin];

      await act(() => {
        result.current.setRoles('space1', initialRoles);
      });
      expect(result.current.roles.space1).toEqual(initialRoles);

      await act(() => {
        result.current.setRoles('space1', updatedRoles);
      });
      expect(result.current.roles.space1).toEqual(updatedRoles);
    });
  });

  describe('setIsReady', () => {
    it('应该正确设置空间数据准备状态', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      await act(() => {
        result.current.setIsReady('space1', true);
      });

      expect(result.current.isReady.space1).toBe(true);
    });

    it('应该能够为多个空间设置不同的准备状态', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      await act(() => {
        result.current.setIsReady('space1', true);
        result.current.setIsReady('space2', false);
      });

      expect(result.current.isReady.space1).toBe(true);
      expect(result.current.isReady.space2).toBe(false);
    });

    it('应该能够更新已存在空间的准备状态', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      await act(() => {
        result.current.setIsReady('space1', false);
      });
      expect(result.current.isReady.space1).toBe(false);

      await act(() => {
        result.current.setIsReady('space1', true);
      });
      expect(result.current.isReady.space1).toBe(true);
    });
  });

  describe('destory', () => {
    it('应该正确清除空间数据', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());
      const roles = [SpaceRoleType.Owner];

      // 设置初始数据
      await act(() => {
        result.current.setRoles('space1', roles);
        result.current.setIsReady('space1', true);
      });

      // 验证数据已设置
      expect(result.current.roles.space1).toEqual(roles);
      expect(result.current.isReady.space1).toBe(true);

      // 销毁数据
      await act(() => {
        result.current.destory('space1');
      });

      // 验证数据已清除
      expect(result.current.roles.space1).toEqual([]);
      expect(result.current.isReady.space1).toBeUndefined();
    });

    it('应该只清除指定空间的数据', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      // 设置两个空间的数据
      await act(() => {
        result.current.setRoles('space1', [SpaceRoleType.Owner]);
        result.current.setIsReady('space1', true);
        result.current.setRoles('space2', [SpaceRoleType.Member]);
        result.current.setIsReady('space2', true);
      });

      // 只销毁 space1 的数据
      await act(() => {
        result.current.destory('space1');
      });

      // 验证 space1 的数据已清除
      expect(result.current.roles.space1).toEqual([]);
      expect(result.current.isReady.space1).toBeUndefined();

      // 验证 space2 的数据保持不变
      expect(result.current.roles.space2).toEqual([SpaceRoleType.Member]);
      expect(result.current.isReady.space2).toBe(true);
    });
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', async () => {
      const { useSpaceAuthStore } = await vi.importActual(
        '../../src/space/store',
      );
      const { result } = renderHook(() => useSpaceAuthStore());

      // 重置 store 确保测试环境干净
      await act(() => {
        Object.keys(result.current.roles).forEach(spaceId => {
          result.current.destory(spaceId);
        });
      });

      // 验证初始状态
      expect(result.current.roles).toEqual({});
      expect(result.current.isReady).toEqual({});
    });
  });
});
