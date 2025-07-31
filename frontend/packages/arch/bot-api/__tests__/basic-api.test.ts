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

import { vi } from 'vitest';

import { basicApi } from '../src/basic-api';
import { axiosInstance } from '../src/axios';

vi.mock('@coze-arch/idl/basic_api', () => ({
  default: vi.fn().mockImplementation(r => r),
}));

vi.mock('../src/axios', () => ({
  axiosInstance: {
    request: vi.fn(),
  },
}));

describe('basic-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be properly instantiated', () => {
    expect(basicApi).toBeDefined();
  });

  describe('API methods', () => {
    it('should make request with correct headers', async () => {
      const mockResponse = { data: 'test data' };
      (axiosInstance.request as any).mockResolvedValue(mockResponse);

      const mockParams = {
        url: '/test',
        method: 'GET',
        headers: { 'Custom-Header': 'value' },
      };
      const mockConfig = {
        headers: { 'Another-Header': 'another-value' },
      };

      // @ts-expect-error - we know this is a valid method call
      await basicApi.request(mockParams, mockConfig);

      expect(axiosInstance.request).toHaveBeenCalledWith({
        ...mockParams,
        ...mockConfig,
        headers: {
          'Custom-Header': 'value',
          'Another-Header': 'another-value',
          'Agw-Js-Conv': 'str',
        },
      });
    });

    it('should make request with default empty config', async () => {
      const mockResponse = { data: 'test data' };
      (axiosInstance.request as any).mockResolvedValue(mockResponse);

      const mockParams = {
        url: '/test',
        method: 'GET',
        headers: { 'Custom-Header': 'value' },
      };

      // @ts-expect-error - we know this is a valid method call
      await basicApi.request(mockParams);

      expect(axiosInstance.request).toHaveBeenCalledWith({
        ...mockParams,
        headers: {
          'Custom-Header': 'value',
          'Agw-Js-Conv': 'str',
        },
      });
    });

    it('should handle request without headers', async () => {
      const mockResponse = { data: 'test data' };
      (axiosInstance.request as any).mockResolvedValue(mockResponse);

      const mockParams = {
        url: '/test',
        method: 'GET',
      };

      // @ts-expect-error - we know this is a valid method call
      await basicApi.request(mockParams);

      expect(axiosInstance.request).toHaveBeenCalledWith({
        ...mockParams,
        headers: {
          'Agw-Js-Conv': 'str',
        },
      });
    });
  });
});
