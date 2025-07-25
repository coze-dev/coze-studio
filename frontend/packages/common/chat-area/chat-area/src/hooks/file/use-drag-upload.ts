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
 
import { useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';

import { checkHasFileOnDrag, getFileListByDrag } from '../../utils/upload';
import { localLog } from '../../utils/local-log';
import { usePreference } from '../../context/preference';
import { useValidateFileList } from './use-validate-file-list';
import { useCreateFileAndUpload } from './use-upload';

export const useDragUpload = (closeDelay = 100) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadFile = useCreateFileAndUpload();
  const ref = useRef<HTMLDivElement>(null);
  const { fileLimit, enableMultimodalUpload, enableDragUpload } =
    usePreference();
  const validateFileList = useValidateFileList();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (!timer.current) {
      return;
    }
    clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    const target = ref.current;
    /**
     * 拖拽上传功能需要配合多模态消息功能使用
     */
    if (!enableMultimodalUpload || !enableDragUpload) {
      return;
    }

    if (!target) {
      localLog('No Drag Target');
      return;
    }

    const onDragEnter = (e: HTMLElementEventMap['dragenter']) => {
      localLog('dragenter', e);
      clearTimer();
      if (!checkHasFileOnDrag(e)) {
        return;
      }

      setIsDragOver(true);
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
      localLog('dragover', e);
      if (!checkHasFileOnDrag(e)) {
        return;
      }
      setIsDragOver(true);
    };
    const onDragLeave = (e: HTMLElementEventMap['dragleave']) => {
      clearTimer();
      // 第一次触发 onDragEnter 事件的 target 也将在最后触发一次 onDragLeave, 这两个事件 target 相同
      // drag 图中, 进入到 child dom 时会触发 onDragLeave 但是这个事件的 target 和第一次触发的 target 不同
      localLog('dragleave', {
        e,
      });

      timer.current = setTimeout(() => {
        setIsDragOver(false);
      }, closeDelay);
    };
    const onDragDrop = (e: HTMLElementEventMap['drop']) => {
      localLog('dragdrop', e);
      clearTimer();

      if (!checkHasFileOnDrag(e)) {
        return;
      }
      setIsDragOver(false);
      e.preventDefault();
      const fileList = getFileListByDrag(e);

      const verifiedFileList = validateFileList({ fileLimit, fileList });

      // 文件校验
      if (!verifiedFileList.length) {
        return;
      }

      verifiedFileList.forEach(file => {
        uploadFile(nanoid(), file);
      });
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
  }, [enableMultimodalUpload, ref.current]);

  return { ref, isDragOver };
};
