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
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/bot-semi';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { getImageUrl } from '@/component/onboarding-message/onboarding-editor/method/get-image-url';

vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    GetImagexShortUrl: vi.fn(),
  },
}));
vi.mock('@coze-arch/bot-semi', () => ({
  Toast: {
    error: vi.fn(),
  },
}));
vi.mock('@coze-arch/i18n');

describe('getImageUrl', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns image URL when API call is successful and image is appropriate', async () => {
    const mockRequest = { Key: 'testUri' };
    const mockResponse = {
      code: '200',
      msg: 'Success',
      data: {
        url_info: {
          testUri: {
            review_status: true,
            url: 'http://test.com',
          },
        },
      },
    };
    (PlaygroundApi.GetImagexShortUrl as Mock).mockResolvedValue(mockResponse);

    const result = await getImageUrl(mockRequest);

    expect(result).toEqual({
      code: 200,
      message: 'Success',
      data: {
        url: 'http://test.com',
      },
    });
  });

  it('throw error && shows error toast when image is inappropriate', async () => {
    const mockRequest = { Key: 'testUri' };
    const mockResponse = {
      code: '200',
      msg: 'Success',
      data: {
        url_info: {
          testUri: {
            review_status: false,
            url: 'http://test.com',
          },
        },
      },
    };
    (PlaygroundApi.GetImagexShortUrl as Mock).mockResolvedValue(mockResponse);

    await expect(getImageUrl(mockRequest)).rejects.toThrow(
      'inappropriate_contents',
    );
    expect(Toast.error).toHaveBeenCalledWith({
      content: I18n.t('inappropriate_contents'),
      showClose: false,
    });
  });

  it('throw error when image URL is not present', () => {
    const mockRequest = { Key: 'testUri' };
    const mockResponse = {
      code: '200',
      msg: 'Success',
      data: {
        url_info: {
          testUri: {
            review_status: 'appropriate',
          },
        },
      },
    };
    (PlaygroundApi.GetImagexShortUrl as Mock).mockResolvedValue(mockResponse);

    expect(getImageUrl(mockRequest)).rejects.toThrow('inappropriate_contents');
  });
});
