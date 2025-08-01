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

// Import axios configuration to trigger Toast configuration
import '../src/axios';

vi.mock('@coze-arch/bot-semi', () => ({
  Toast: {
    config: vi.fn(),
    error: vi.fn(),
  },
}));

// emulating the isApiError function
vi.mock('@coze-arch/bot-http', () => {
  // Save the original axiosInstant.interceptors.response.use method
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
    ApiError: vi
      .fn()
      .mockImplementation(function (this: any, code: string, msg: string) {
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
    // Import axios configuration to trigger Toast configuration and blocker registration
    await import('../src/axios');

    // Verify that Toast.config is called
    expect(Toast.config).toHaveBeenCalledWith({ top: 80 });

    // Get the registered interceptor function
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
      // Create an API error
      const apiError = new (ApiError as any)('500', 'API Error');

      // isApiError returns true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // If no errors are thrown, the test should fail
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
      // Create an API error and set __disableErrorToast to true
      const apiError = new (ApiError as any)('401', 'Unauthorized');
      apiError.config.__disableErrorToast = true;

      // isApiError returns true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // If no errors are thrown, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(apiError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(apiError);
      }
    });

    it('should not show error toast when error has no message', () => {
      // Create an API error with no message
      const apiError = new (ApiError as any)('403', undefined);

      // isApiError returns true
      (isApiError as any).mockReturnValue(true);

      try {
        onRejected(apiError);
        // If no errors are thrown, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(apiError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(apiError);
      }
    });

    it('should not show error toast when isApiError returns false', () => {
      // Create a normal error
      const regularError = new Error('Regular Error');
      (regularError as any).msg = 'Error message';

      // isApiError returned false
      (isApiError as any).mockReturnValue(false);

      try {
        onRejected(regularError);
        // If no errors are thrown, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(regularError);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(regularError);
      }
    });

    it('should handle null or undefined error', () => {
      // Test null error
      try {
        onRejected(null);
        // If no errors are thrown, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(null);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(null);
      }

      vi.clearAllMocks();

      // Test undefined error
      try {
        onRejected(undefined);
        // If no errors are thrown, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(isApiError).toHaveBeenCalledWith(undefined);
        expect(Toast.error).not.toHaveBeenCalled();
        expect(error).toBe(undefined);
      }
    });
  });
});
