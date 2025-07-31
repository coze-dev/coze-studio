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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Toast } from '@coze-arch/bot-semi';

import { useDragAndPasteUpload } from '../../src/use-drag-and-paste-upload';

// Mock dependencies
vi.mock('@coze-arch/bot-semi', () => ({
  Toast: {
    warning: vi.fn(),
  },
}));

describe('useDragAndPasteUpload', () => {
  const mockRef = {
    current: document.createElement('div'),
  };

  const mockProps = {
    ref: mockRef,
    onUpload: vi.fn(),
    disableDrag: false,
    disablePaste: false,
    fileLimit: 5,
    maxFileSize: 1024 * 1024, // 1MB
    isFileFormatValid: (file: File) => file.type.startsWith('image/'),
    getExistingFileCount: () => 0,
    closeDelay: 100,
    invalidFormatMessage: 'Invalid format',
    invalidSizeMessage: 'File too large',
    fileExceedsMessage: 'Too many files',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle drag events correctly', () => {
    const { result } = renderHook(() => useDragAndPasteUpload(mockProps));

    // Initial state
    expect(result.current.isDragOver).toBe(false);

    // Simulate dragover
    act(() => {
      const dragOverEvent = new Event('dragover') as DragEvent;
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
        },
      });
      mockRef.current.dispatchEvent(dragOverEvent);
    });

    expect(result.current.isDragOver).toBe(true);

    // Simulate dragleave
    act(() => {
      const dragLeaveEvent = new Event('dragleave') as DragEvent;
      mockRef.current.dispatchEvent(dragLeaveEvent);
    });

    // Wait for closeDelay
    act(() => {
      vi.advanceTimersByTime(mockProps.closeDelay);
    });
    expect(result.current.isDragOver).toBe(false);
  });

  it('should handle file drop correctly', () => {
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    renderHook(() => useDragAndPasteUpload(mockProps));

    // Simulate drop
    act(() => {
      const dropEvent = new Event('drop') as DragEvent;
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
          files: {
            0: validFile,
            length: 1,
            item: (index: number) => (index === 0 ? validFile : null),
          },
        },
      });
      mockRef.current.dispatchEvent(dropEvent);
    });

    expect(mockProps.onUpload).toHaveBeenCalledWith([validFile]);
  });

  it('should handle paste events correctly', () => {
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    renderHook(() => useDragAndPasteUpload(mockProps));

    // Simulate paste
    act(() => {
      const pasteEvent = new Event('paste') as ClipboardEvent;
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          files: {
            0: validFile,
            length: 1,
            item: (index: number) => (index === 0 ? validFile : null),
          },
        },
      });
      mockRef.current.dispatchEvent(pasteEvent);
    });

    expect(mockProps.onUpload).toHaveBeenCalledWith([validFile]);
  });

  it('should validate file format', () => {
    const invalidFile = new File(['content'], 'test.txt', {
      type: 'text/plain',
    });
    renderHook(() => useDragAndPasteUpload(mockProps));

    // Simulate drop with invalid file
    act(() => {
      const dropEvent = new Event('drop') as DragEvent;
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
          files: {
            0: invalidFile,
            length: 1,
            item: (index: number) => (index === 0 ? invalidFile : null),
          },
        },
      });
      mockRef.current.dispatchEvent(dropEvent);
    });

    expect(Toast.warning).toHaveBeenCalledWith({
      content: mockProps.invalidFormatMessage,
      showClose: false,
    });
    expect(mockProps.onUpload).not.toHaveBeenCalled();
  });

  it('should validate file size', () => {
    const largeFile = new File(['content'.repeat(1000000)], 'large.jpg', {
      type: 'image/jpeg',
    });
    renderHook(() => useDragAndPasteUpload(mockProps));

    // Simulate drop with large file
    act(() => {
      const dropEvent = new Event('drop') as DragEvent;
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
          files: {
            0: largeFile,
            length: 1,
            item: (index: number) => (index === 0 ? largeFile : null),
          },
        },
      });
      mockRef.current.dispatchEvent(dropEvent);
    });

    expect(Toast.warning).toHaveBeenCalledWith({
      content: mockProps.invalidSizeMessage,
      showClose: false,
    });
    expect(mockProps.onUpload).not.toHaveBeenCalled();
  });

  it('should validate file count', () => {
    const mockPropsWithExistingFiles = {
      ...mockProps,
      getExistingFileCount: () => 4,
    };

    const validFiles = [
      new File(['content1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['content2'], 'test2.jpg', { type: 'image/jpeg' }),
    ];

    renderHook(() => useDragAndPasteUpload(mockPropsWithExistingFiles));

    // Simulate drop with too many files
    act(() => {
      const dropEvent = new Event('drop') as DragEvent;
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
          files: {
            0: validFiles[0],
            1: validFiles[1],
            length: 2,
            item: (index: number) => validFiles[index] || null,
          },
        },
      });
      mockRef.current.dispatchEvent(dropEvent);
    });

    expect(Toast.warning).toHaveBeenCalledWith({
      content: mockProps.fileExceedsMessage,
      showClose: false,
    });
    expect(mockProps.onUpload).not.toHaveBeenCalled();
  });

  it('should respect disableDrag prop', () => {
    const { result } = renderHook(() =>
      useDragAndPasteUpload({ ...mockProps, disableDrag: true }),
    );

    // Simulate dragover
    act(() => {
      const dragOverEvent = new Event('dragover') as DragEvent;
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: {
          types: ['Files'],
        },
      });
      mockRef.current.dispatchEvent(dragOverEvent);
    });

    expect(result.current.isDragOver).toBe(false);
  });

  it('should respect disablePaste prop', () => {
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    renderHook(() =>
      useDragAndPasteUpload({ ...mockProps, disablePaste: true }),
    );

    // Simulate paste
    act(() => {
      const pasteEvent = new Event('paste') as ClipboardEvent;
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: {
          files: {
            0: validFile,
            length: 1,
            item: (index: number) => (index === 0 ? validFile : null),
          },
        },
      });
      mockRef.current.dispatchEvent(pasteEvent);
    });

    expect(mockProps.onUpload).not.toHaveBeenCalled();
  });
});
