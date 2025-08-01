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

import '@testing-library/jest-dom';

import React from 'react';

import { describe, it, expect, vi } from 'vitest';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';

import {
  computePosition,
  getInitBackground,
  getOriginImageFromBackgroundInfo,
} from '../src/utils';

vi.mock('@coze-arch/bot-semi', () => ({
  UIToast: {
    error: vi.fn(),
  },
}));

vi.mock('@coze-common/chat-uikit', () => ({
  MODE_CONFIG: {
    pc: {
      size: {
        width: 486,
        height: 346,
      },
      centerWidth: 346,
    },
    mobile: {
      size: {
        width: 248,
        height: 346,
      },
      centerWidth: 206,
    },
  },
}));

vi.mock('@coze-arch/coze-design', () => ({
  Avatar: vi.fn(),
  Tag: vi.fn(),
}));
vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(() => Error),
}));

vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(() => Error),
}));

describe('should compute position correctly', () => {
  const cropperRef = React.createRef();
  const cropperMock = {
    getCanvasData: vi.fn(() => ({
      left: 10,
    })),
    getImageData: vi.fn(() => ({
      left: 5,
      width: 20,
    })),
  };
  // Using vi.spyOn to simulate the behavior of createRef
  const createRefSpy = vi.spyOn(React, 'createRef').mockReturnValue(cropperRef);
  // Manually set the value of cropperRef.current
  cropperRef.current = {
    cropper: cropperMock,
  };
  cropperRef.current = {
    cropper: {
      getCanvasData: vi.fn(() => ({
        left: 10,
      })),
      getImageData: vi.fn(() => ({
        left: 5,
        width: 20,
      })),
    },
  };

  const mode = 'pc';
  const result = computePosition(mode, cropperRef);
  expect(result.left).toBe(0.03);
  expect(result.right).toBe(0.92);
  // Restore the original behavior of createRef
  createRefSpy.mockRestore();
});

describe('getOriginImageFromBackgroundInfo', () => {
  it('should return origin image info', () => {
    const value: BackgroundImageInfo[] = [
      {
        web_background_image: {
          origin_image_uri: '123',
          origin_image_url: '234',
        },
      },
    ];
    const info = getOriginImageFromBackgroundInfo(value);
    expect(info).toMatchObject({
      uri: '123',
      url: '234',
    });
  });
});

describe('getInitBackground', () => {
  it('should return origin image', () => {
    const value: BackgroundImageInfo[] = [
      {
        web_background_image: {
          origin_image_uri: '123',
          origin_image_url: '234',
        },
      },
    ];
    const info = getInitBackground({
      isGenerateSuccess: false,
      originBackground: value,
      selectedImageInfo: {
        tar_uri: '222',
        tar_url: '111',
      },
    });
    expect(info).toMatchObject({
      uri: '123',
      url: '234',
    });
  });

  it('should return selected image', () => {
    const value: BackgroundImageInfo[] = [
      {
        web_background_image: {
          origin_image_uri: '123',
          origin_image_url: '234',
        },
      },
    ];
    const info = getInitBackground({
      isGenerateSuccess: true,
      originBackground: value,
      selectedImageInfo: {
        tar_uri: '222',
        tar_url: '111',
      },
    });
    expect(info).toMatchObject({
      url: '111',
    });
  });

  it('should return empty image', () => {
    const value: BackgroundImageInfo[] = [
      {
        web_background_image: {},
      },
    ];
    const info = getInitBackground({
      isGenerateSuccess: false,
      originBackground: value,
      selectedImageInfo: {
        tar_uri: '222',
        tar_url: '111',
      },
    });
    expect(info).toMatchObject({});
  });
});
