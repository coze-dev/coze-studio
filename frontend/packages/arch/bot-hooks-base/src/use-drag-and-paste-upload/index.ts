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

import { type RefObject, useEffect, useRef, useState } from 'react';

import { Toast } from '@coze-arch/bot-semi';

import { isHasFileByDrag } from './helper/is-has-file-by-drag';
import { getFileListByDragOrPaste } from './helper/get-file-list-by-drag';

export interface UseDragAndPasteUploadParam {
  ref: RefObject<HTMLDivElement>;
  /**
   * Callback that triggers upload
   */
  onUpload: (fileList: File[]) => void;
  /**
   * Whether to disable drag-and-drop uploads
   */
  disableDrag: boolean;
  /**
   * Whether to disable paste uploads
   */
  disablePaste: boolean;
  /**
   * Maximum number of uploaded files
   */
  fileLimit: number;
  /**
   * File size, eg: 10MB = 10 * 1024 * 1024
   */
  maxFileSize: number;
  invalidSizeMessage: string | undefined;
  invalidFormatMessage: string | undefined;
  fileExceedsMessage: string | undefined;
  /**
   * Is the file format legal?
   */
  isFileFormatValid: (file: File) => boolean;
  /**
   * @Returns the number of existing files
   */
  getExistingFileCount: () => number;
  /**
   * Delay in state change when the user leaves the drag area
   * @default 100
   */
  closeDelay: number | undefined;
}

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function -- drag callback
export const useDragAndPasteUpload = ({
  onUpload,
  disableDrag,
  disablePaste,
  fileLimit,
  isFileFormatValid,
  maxFileSize,
  getExistingFileCount,
  closeDelay = 100,
  invalidFormatMessage,
  invalidSizeMessage,
  fileExceedsMessage,
  ref,
}: UseDragAndPasteUploadParam) => {
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * When dragging, the pointer from the parent dom to the child dom will fire onDragEnter onDragLeave in quick succession, resulting in a state flow error
   * Adding a delay to the state flow on onLeave avoids the flow problem
   * When dragEnter dragLeave is triggered, event.target does not necessarily point to parent dom, so it cannot be judged by target
   */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (!timer.current) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
  };

  const handleDropOrPaste = (
    e: HTMLElementEventMap['paste'] | HTMLElementEventMap['drop'],
  ) => getFileListByDragOrPaste(e);

  const handleUpload = (fileList: File[]) => {
    if (!fileList.some(isFileFormatValid)) {
      Toast.warning({
        content: invalidFormatMessage,
        showClose: false,
      });
      return;
    }

    if (!fileList.some(file => file.size <= maxFileSize)) {
      Toast.warning({
        content: invalidSizeMessage,
        showClose: false,
      });
      return;
    }

    const remainingCount = fileLimit - getExistingFileCount();

    if (fileList.length > remainingCount) {
      Toast.warning({
        content: fileExceedsMessage,
        showClose: false,
      });
      return;
    }

    onUpload(fileList);
  };

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      return;
    }
    if (disableDrag) {
      return;
    }

    const onDragEnter = (e: HTMLElementEventMap['dragenter']) => {
      clearTimer();
      if (!isHasFileByDrag(e)) {
        return;
      }
    };

    const onDragOver = (e: HTMLElementEventMap['dragover']) => {
      /**
       * {@link https://segmentfault.com/q/1010000011746669}
       * Principle:
       * The default behavior blocked here is to enable editable mode, specifically the document.designMode property,
       * This property is turned off by default, and when turned on, you can edit the webpage.
       * The way to open it is document.designMode = "on"; after opening it, there is no need to block the default in the monitor dragover event.
       */
      e.preventDefault();
      clearTimer();
      if (!isHasFileByDrag(e)) {
        return;
      }
      setIsDragOver(true);
    };
    const onDragLeave = (e: HTMLElementEventMap['dragleave']) => {
      clearTimer();

      timer.current = setTimeout(() => {
        setIsDragOver(false);
      }, closeDelay);
    };
    const onDragDrop = (e: HTMLElementEventMap['drop']) => {
      clearTimer();

      if (!isHasFileByDrag(e)) {
        return;
      }
      setIsDragOver(false);
      e.preventDefault();
      handleUpload(handleDropOrPaste(e));
    };
    target.addEventListener('dragenter', onDragEnter);
    target.addEventListener('dragover', onDragOver);
    target.addEventListener('dragleave', onDragLeave);
    target.addEventListener('drop', onDragDrop);

    return () => {
      clearTimer();
      target.removeEventListener('dragenter', onDragEnter);
      target.removeEventListener('dragover', onDragOver);
      target.removeEventListener('dragleave', onDragLeave);
      target.removeEventListener('drop', onDragDrop);
    };
  }, [ref.current, disableDrag]);

  useEffect(() => {
    const target = ref.current;

    if (!target) {
      return;
    }

    const onPaste = (e: HTMLElementEventMap['paste']) => {
      const fileList = handleDropOrPaste(e);

      if (!fileList.length) {
        return;
      }

      e.preventDefault();

      if (disablePaste) {
        return;
      }

      handleUpload(fileList);
    };
    target.addEventListener('paste', onPaste);

    return () => {
      target.removeEventListener('paste', onPaste);
    };
  }, [ref.current, disablePaste]);

  return { isDragOver };
};
