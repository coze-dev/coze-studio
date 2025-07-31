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

import { type Mock } from 'vitest';
import { DeveloperApi } from '@coze-arch/bot-api';

import { getUploadToken } from '@/component/onboarding-message/onboarding-editor/method/get-upload-token';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUploadAuthToken: vi.fn(),
  },
}));
describe('getUploadToken', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the expected response on successful API call', async () => {
    const mockResponse = {
      code: 200,
      msg: 'Success',
      data: {
        auth: {
          token: 'mockToken',
        },
      },
    };
    (DeveloperApi.GetUploadAuthToken as Mock).mockResolvedValue(mockResponse);

    const result = await getUploadToken();

    expect(result).toEqual({
      code: 200,
      message: 'Success',
      data: {
        ...mockResponse.data,
        ...mockResponse.data.auth,
      },
    });
  });

  it('throws an error when the API call fails', async () => {
    const mockError = new Error('API call failed');
    (DeveloperApi.GetUploadAuthToken as Mock).mockRejectedValue(mockError);

    await expect(getUploadToken()).rejects.toThrow('API call failed');
  });
});
