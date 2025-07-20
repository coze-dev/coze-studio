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
 
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { Toast } from '@coze-arch/bot-semi';
import { axiosInstance, isApiError, ApiError } from '@coze-arch/bot-http';

// 导入 axios 配置以触发 Toast 配置
import '../src/axios';

vi.mock('@coze-arch/bot-semi', () => ({
  Toast: {
    config: vi.fn(),
    error: vi.fn(),
  },
}));

// 模拟 isApiError 函数
vi.mock('@coze-arch/bot-http', () => {
  // 保存原始的 axiosInstance.interceptors.response.use 方法
  const originalUse = vi.fn();

  return {
    axiosInstance: {
      interceptors: {
        response: {
          use: originalUse,
        },
      },
    },
    isApiError: vi.fn(),
    ApiError: vi.fn().mockImplementation(function (
      this: any,
      code: string,
      msg: string,
    ) {
      this.code = code;
      this.msg = msg;
      this.config = {};
      this.name = 'ApiError';
    }),
  };
});

describe('axios configuration', () => {
  let onFulfilled: Function;
  let onRejected: Function;

  beforeAll(async () => {
    // 导入 axios 配置以触发 Toast 配置和拦截器注册
    await import('../src/axios');

    // 验证 Toast.config 被调用
    expect(Toast.config).toHaveBeenCalledWith({ top: 80 });

    // 获取注册的拦截器函数
    const useArgs = (axiosInstance.interceptors.response.use as any).mock
      .calls[0];
    onFulfilled = useArgs[0];
    onRejected = useArgs[1];
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('response interceptor', () => {
    it('should return response data directly on success', () => {
      const mockData = { foo: 'bar' };
      const mockResponse = { data: mockData };

      const result = onFulfilled(mockResponse);

      expect(result).toEqual(mockData);
    });

    it('should show error toast when API error occurs', () => {
      // 创建一个 API 错误
      const apiError = new (ApiError as any)('500', 'API Error');

      // 模拟 isApiError 返回 true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(apiError);
        expect(Toast.error).toHaveBeenCalledWith({
          content: apiError.msg,
          showClose: false,
        });
        expect(error).toBe(apiError);
      }
    });

    it('should not show error toast when __disableErrorToast is true', () => {
      // 创建一个 API 错误，并设置 __disableErrorToast 为 true
      const apiError = new (ApiError as any)('401', 'Unauthorized');
      apiError.config.__disableErrorToast = true;

      // 模拟 isApiError 返回 true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(apiError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(apiError);
      }
    });

    it('should not show error toast when error has no message', () => {
      // 创建一个没有消息的 API 错误
      const apiError = new (ApiError as any)('403', undefined);

      // 模拟 isApiError 返回 true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(apiError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(apiError);
      }
    });

    it('should not show error toast when isApiError returns false', () => {
      // 创建一个普通错误
      const regularError = new Error('Regular Error');
      (regularError as any).msg = 'Error message';

      // 模拟 isApiError 返回 false
      (isApiError as any).mockReturnValue(false);

      try {
        onRejected(regularError);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(regularError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(regularError);
      }
    });

    it('should handle null or undefined error', () => {
      // 测试 null 错误
      try {
        onRejected(null);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(null);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(null);
      }

      vi.clearAllMocks();

      // 测试 undefined 错误
      try {
        onRejected(undefined);
        // 如果没有抛出错误，测试应该失败
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(undefined);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(undefined);
      }
    });
  });
});
