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
   * 触发上传的回调
   */
  onUpload: (fileList: File[]) => void;
  /**
   * 是否禁用拖拽上传
   */
  disableDrag: boolean;
  /**
   * 是否禁用粘贴上传
   */
  disablePaste: boolean;
  /**
   * 最大上传的文件数量
   */
  fileLimit: number;
  /**
   * 文件大小, eg: 10MB = 10 * 1024 * 1024
   */
  maxFileSize: number;
  invalidSizeMessage: string | undefined;
  invalidFormatMessage: string | undefined;
  fileExceedsMessage: string | undefined;
  /**
   * 文件格式是否合法
   */
  isFileFormatValid: (file: File) => boolean;
  /**
   * @returns 已存在文件的数量
   */
  getExistingFileCount: () => number;
  /**
   * 用户离开拖拽区域时, state 变化的延迟
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
   * drag 时, 指针从 parent dom 进入到 child dom 时会快速连续触发 onDragEnter onDragLeave 导致状态流转错误
   * 在 onLeave 时给状态流转加上延时能够避免流转问题
   * 触发 dragEnter dragLeave 时, event.target 不一定指向 parent dom, 所以也无法通过 target 来判断
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
       * 原理:
       * 这里阻止的默认行为是开启可编辑模式，具体就是document.designMode属性，
       * 该属性默认是off关闭的，当开启之后就可以对网页进行编辑
       * 开启的方式就是document.designMode = "on"; 开启之后就不用在监听dragover事件中阻止默认了
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
