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
import { userStoreService } from '@coze-studio/user-store';

import { upLoadFile } from '../src/upload-file';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUploadAuthToken: vi.fn(() =>
      Promise.resolve({ data: { service_id: '', upload_host: '' } }),
    ),
  },
}));
vi.mock('@coze-studio/user-store', () => ({
  userStoreService: {
    getUserInfo: vi.fn(() => ({
      user_id_str: '',
    })),
  },
}));
vi.mock('@coze-studio/uploader-adapter', () => {
  class MockUploader {
    userId: string;
    constructor({ userId }) {
      this.userId = userId;
    }
    on(event: string, cb: (data: any) => void) {
      if (event === 'complete' && this.userId) {
        cb({ uploadResult: { Uri: 'test_url' } });
      } else if (event === 'error' && !this.userId) {
        cb({ extra: 'error' });
      } else if (event === 'progress') {
        cb(50);
      }
    }
  }
  return {
    getUploader: vi.fn(
      (props: any, isOverSea?: boolean) => new MockUploader(props),
    ),
  };
});

describe('upload-file', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('upLoadFile should resolve Url of result if upload success', async () => {
    // mock `userId` non-empty to invoke upload success
    (userStoreService.getUserInfo as Mock).mockReturnValue({
      user_id_str: 'test',
    });
    const res = await upLoadFile({
      file: new File([], 'test_file'),
      fileType: 'image',
    });
    expect(res).equal('test_url');
    global.IS_OVERSEA = false;
    (userStoreService.getUserInfo as Mock).mockReturnValue({
      user_id_str: 'test',
    });
    const res2 = await upLoadFile({
      file: new File([], 'test_file'),
      fileType: 'image',
    });
    expect(res2).equal('test_url');
  });

  test('upLoadFile should reject extra info of result if upload failed', () => {
    // mock `userId` empty to invoke upload failed
    (userStoreService.getUserInfo as Mock).mockReturnValue({ user_id_str: '' });
    expect(
      upLoadFile({
        file: new File([], 'test_file'),
        fileType: 'image',
      }),
    ).rejects.toThrow('error');
  });

  test('upLoadFile should use getUploadAuthToken if biz is not bot or workflow ', () => {
    // mock `userId` empty to invoke upload failed
    (userStoreService.getUserInfo as Mock).mockReturnValue({ user_id_str: '' });
    expect(
      upLoadFile({
        biz: 'community',
        file: new File([], 'test_file'),
        fileType: 'image',
        getUploadAuthToken: vi.fn(() =>
          Promise.resolve({ data: { service_id: '', upload_host: '' } }),
        ),
      }),
    ).rejects.toThrow('error');
  });
});
