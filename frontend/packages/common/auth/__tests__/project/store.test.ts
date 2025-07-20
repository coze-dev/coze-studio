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
 
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { ProjectRoleType } from '../../src/project/constants';

vi.stubGlobal('IS_DEV_MODE', true);

describe('Project Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe('setRoles', () => {
    it('应该正确设置项目角色', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId = 'test-project-1';
      const roles = [ProjectRoleType.Owner];

      await act(() => {
        result.current.setRoles(projectId, roles);
      });

      expect(result.current.roles[projectId]).toEqual(roles);
    });

    it('应该能够更新已存在的项目角色', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId = 'test-project-1';
      const initialRoles = [ProjectRoleType.Owner];
      const updatedRoles = [ProjectRoleType.Editor];

      await act(() => {
        result.current.setRoles(projectId, initialRoles);
      });
      expect(result.current.roles[projectId]).toEqual(initialRoles);

      await act(() => {
        result.current.setRoles(projectId, updatedRoles);
      });
      expect(result.current.roles[projectId]).toEqual(updatedRoles);
    });

    it('应该能够同时管理多个项目的角色', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId1 = 'test-project-1';
      const projectId2 = 'test-project-2';
      const roles1 = [ProjectRoleType.Owner];
      const roles2 = [ProjectRoleType.Editor];

      await act(() => {
        result.current.setRoles(projectId1, roles1);
        result.current.setRoles(projectId2, roles2);
      });

      expect(result.current.roles[projectId1]).toEqual(roles1);
      expect(result.current.roles[projectId2]).toEqual(roles2);
    });
  });

  describe('setIsReady', () => {
    it('应该正确设置项目准备状态', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId = 'test-project-1';

      await act(() => {
        result.current.setIsReady(projectId, true);
      });

      expect(result.current.isReady[projectId]).toBe(true);
    });

    it('应该能够更新已存在的项目准备状态', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId = 'test-project-1';

      await act(() => {
        result.current.setIsReady(projectId, true);
      });
      expect(result.current.isReady[projectId]).toBe(true);

      await act(() => {
        result.current.setIsReady(projectId, false);
      });
      expect(result.current.isReady[projectId]).toBe(false);
    });

    it('应该能够同时管理多个项目的准备状态', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId1 = 'test-project-1';
      const projectId2 = 'test-project-2';

      await act(() => {
        result.current.setIsReady(projectId1, true);
        result.current.setIsReady(projectId2, false);
      });

      expect(result.current.isReady[projectId1]).toBe(true);
      expect(result.current.isReady[projectId2]).toBe(false);
    });
  });

  describe('destory', () => {
    it('应该正确清除项目数据', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId = 'test-project-1';
      const roles = [ProjectRoleType.Owner];

      // 设置初始数据
      await act(() => {
        result.current.setRoles(projectId, roles);
        result.current.setIsReady(projectId, true);
      });

      // 验证数据已设置
      expect(result.current.roles[projectId]).toEqual(roles);
      expect(result.current.isReady[projectId]).toBe(true);

      // 销毁数据
      result.current.destory(projectId);

      // 验证数据已清除
      expect(result.current.roles[projectId]).toEqual([]);
      expect(result.current.isReady[projectId]).toBe(false);
    });

    it('应该只清除指定项目的数据，不影响其他项目', async () => {
      const { useProjectAuthStore } = await vi.importActual(
        '../../src/project/store',
      );
      const { result } = renderHook(() => useProjectAuthStore());
      const projectId1 = 'test-project-1';
      const projectId2 = 'test-project-2';
      const roles1 = [ProjectRoleType.Owner];
      const roles2 = [ProjectRoleType.Editor];

      // 设置初始数据
      result.current.setRoles(projectId1, roles1);
      result.current.setRoles(projectId2, roles2);
      result.current.setIsReady(projectId1, true);
      result.current.setIsReady(projectId2, true);

      // 销毁项目1的数据
      result.current.destory(projectId1);

      // 验证项目1的数据已清除，项目2的数据保持不变
      expect(result.current.roles[projectId1]).toEqual([]);
      expect(result.current.isReady[projectId1]).toBe(false);
      expect(result.current.roles[projectId2]).toEqual(roles2);
      expect(result.current.isReady[projectId2]).toBe(true);
    });
  });
});
