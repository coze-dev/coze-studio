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

import { describe, it, expect } from 'vitest';

import {
  getFileListByDragOrPaste,
  formatTypeFileListToTypeArray,
} from '../../../src/use-drag-and-paste-upload/helper/get-file-list-by-drag';

describe('getFileListByDragOrPaste', () => {
  it('should handle drag event with files', () => {
    const file1 = new File(['content1'], 'file1.txt');
    const file2 = new File(['content2'], 'file2.txt');
    const fileList = {
      0: file1,
      1: file2,
      length: 2,
      item: (index: number) => (index === 0 ? file1 : file2),
    };

    const dragEvent = {
      dataTransfer: {
        files: fileList,
      },
    } as unknown as DragEvent;

    const result = getFileListByDragOrPaste(dragEvent);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(file1);
    expect(result[1]).toBe(file2);
  });

  it('should handle paste event with files', () => {
    const file1 = new File(['content1'], 'file1.txt');
    const fileList = {
      0: file1,
      length: 1,
      item: (index: number) => (index === 0 ? file1 : null),
    };

    const pasteEvent = {
      clipboardData: {
        files: fileList,
      },
    } as unknown as ClipboardEvent;

    const result = getFileListByDragOrPaste(pasteEvent);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(file1);
  });

  it('should return empty array when no files are present', () => {
    const dragEvent = {
      dataTransfer: {
        files: undefined,
      },
    } as unknown as DragEvent;

    const result = getFileListByDragOrPaste(dragEvent);
    expect(result).toHaveLength(0);
  });
});

describe('formatTypeFileListToTypeArray', () => {
  it('should convert FileList to array of Files', () => {
    const file1 = new File(['content1'], 'file1.txt');
    const file2 = new File(['content2'], 'file2.txt');
    const fileList = {
      0: file1,
      1: file2,
      length: 2,
      item: (index: number) => (index === 0 ? file1 : file2),
    };

    const result = formatTypeFileListToTypeArray(
      fileList as unknown as FileList,
    );
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(file1);
    expect(result[1]).toBe(file2);
  });

  it('should filter out null items', () => {
    const file1 = new File(['content1'], 'file1.txt');
    const fileList = {
      0: file1,
      1: null,
      length: 2,
      item: (index: number) => (index === 0 ? file1 : null),
    };

    const result = formatTypeFileListToTypeArray(
      fileList as unknown as FileList,
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(file1);
  });

  it('should handle empty FileList', () => {
    const fileList = {
      length: 0,
      item: () => null,
    };

    const result = formatTypeFileListToTypeArray(
      fileList as unknown as FileList,
    );
    expect(result).toHaveLength(0);
  });
});
