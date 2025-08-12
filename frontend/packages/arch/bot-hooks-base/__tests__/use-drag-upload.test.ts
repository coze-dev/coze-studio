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

import { renderHook } from '@testing-library/react-hooks';

import { useDragAndPasteUpload } from '../src/use-drag-and-paste-upload';

describe('useDragAndPasteUpload', () => {
  it('return correctly', () => {
    const ref = { current: null };
    const {
      result: { current },
    } = renderHook(() =>
      useDragAndPasteUpload({
        ref,
        disableDrag: false,
        disablePaste: false,
        onUpload: () => 0,
        fileLimit: 3,
        isFileFormatValid: () => true,

        maxFileSize: 10 * 1024 * 1024,
        closeDelay: undefined,
        invalidFormatMessage: '不支持的文件类型',
        invalidSizeMessage: '不支持文件大小超过 10MB',
        fileExceedsMessage: '最多上传 3 个文件',
        getExistingFileCount: () => 0,
      }),
    );

    expect(current).toMatchObject({
      isDragOver: false,
    });
  });
});
