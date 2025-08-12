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
     * The drag-and-drop upload function needs to be used with the multi-modal message function.
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
       * Principle:
       * The default behavior blocked here is to enable editable mode, specifically the document.designMode property,
       * This property is turned off by default, and when turned on, you can edit the webpage.
       * The way to open it is document.designMode = "on"; after opening it, there is no need to block the default in the monitor dragover event.
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
      // The target that fires the onDragEnter event for the first time will also fire onDragLeave for the last time, both events have the same target
      // In the drag diagram, onDragLeave will be triggered when entering child dom, but the target of this event is different from the target fired for the first time.
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

      // file validation
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
