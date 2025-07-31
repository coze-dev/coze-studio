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
import type { Config, STSToken } from '@coze-arch/uploader-interface';

import { getUploader, type FileOption, type CozeUploader } from '../src/index';

// Define all mock in vi.mock factory function
vi.mock('tt-uploader', () => {
  const mockAddImageFile = vi.fn().mockReturnValue('mock-key');
  const mockUploader = vi.fn().mockImplementation(() => ({
    addImageFile: mockAddImageFile,
  }));

  // Mount the mock function on the global object for test case access
  (global as any).__mockAddImageFile = mockAddImageFile;
  (global as any).__mockUploader = mockUploader;

  return {
    __esModule: true,
    default: mockUploader,
  };
});

// Get mock function from global object
const mockAddImageFile = (global as any).__mockAddImageFile;
const mockUploader = (global as any).__mockUploader;

describe('getUploader', () => {
  let config: Config;
  let stsToken: STSToken;
  let file: Blob;

  beforeEach(() => {
    config = {
      userId: 'user1',
      appId: 123,
      imageHost: 'https://img.example.com',
    };
    stsToken = {
      AccessKeyId: 'ak',
      SecretAccessKey: 'sk',
      SessionToken: 'token',
      ExpiredTime: '2024-01-01T00:00:00Z',
      CurrentTime: '2023-01-01T00:00:00Z',
    };
    file = new Blob(['test'], { type: 'text/plain' });
    mockAddImageFile.mockClear();
    mockUploader.mockClear();
  });

  it('should create uploader with correct config (domestic)', () => {
    getUploader(config);
    expect(mockUploader).toHaveBeenCalledWith({
      region: 'cn-north-1',
      imageHost: 'img.example.com',
      appId: 123,
      userId: 'user1',
      useFileExtension: undefined,
      uploadTimeout: undefined,
      imageConfig: undefined,
    });
  });

  it('should create uploader with correct config (oversea)', () => {
    getUploader(config, true);
    expect(mockUploader).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'ap-singapore-1' }),
    );
  });

  it('addFile should call addImageFile with correct params', () => {
    const uploader = getUploader(config) as CozeUploader;
    const fileOption: FileOption = { file, stsToken };
    const key = uploader.addFile(fileOption);
    expect(mockAddImageFile).toHaveBeenCalledWith({ file, stsToken });
    expect(key).toBe('mock-key');
  });

  it('should strip https:// from imageHost', () => {
    config.imageHost = 'https://img2.example.com';
    getUploader(config);
    expect(mockUploader).toHaveBeenCalledWith(
      expect.objectContaining({ imageHost: 'img2.example.com' }),
    );
  });

  it('should fallback to imageFallbackHost if imageHost is missing', () => {
    config.imageHost = undefined;
    config.imageFallbackHost = 'https://fallback.example.com';
    getUploader(config);
    expect(mockUploader).toHaveBeenCalledWith(
      expect.objectContaining({ imageHost: 'fallback.example.com' }),
    );
  });

  it('should use empty string if no imageHost or fallback', () => {
    config.imageHost = undefined;
    config.imageFallbackHost = undefined;
    getUploader(config);
    expect(mockUploader).toHaveBeenCalledWith(
      expect.objectContaining({ imageHost: '' }),
    );
  });
});
