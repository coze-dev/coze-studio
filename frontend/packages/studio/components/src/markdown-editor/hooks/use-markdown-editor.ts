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

import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEventHandler,
} from 'react';

import useEventCallback from 'use-event-callback';
import { I18n } from '@coze-arch/i18n';
import { useDragAndPasteUpload } from '@coze-arch/bot-hooks';

import { primitiveExhaustiveCheck } from '../utils/exhaustive-check';
import { type AsyncAction, type SyncAction } from '../type';
import { getMarkdownImageLink } from '../helpers/get-markdown-image-link';
import { getIsFileFormatValid } from '../helpers/get-is-file-format-valid';
import { getInsertTextAtPosition } from '../helpers/get-insert-text-at-position';
import { getSyncInsertText } from '../helpers/get-insert-text';
import { MAX_FILE_SIZE, getFileSizeReachLimitI18n } from '../constant/file';
import { type ActionBarProps } from '../components/action-bar';
import { type MarkdownEditorProps } from '..';
import { useUpload } from './use-upload-file';

// eslint-disable-next-line max-lines-per-function
export const useMarkdownEditor = ({
  value,
  onChange,
  getUserId = () => '',
  customUpload,
}: MarkdownEditorProps) => {
  const onTriggerSyncAction = (action: SyncAction) => {
    handleInsertText(getSyncInsertText(action));
  };

  const onTriggerAsyncAction = (action: AsyncAction) => {
    const { type, payload } = action;
    if (type === 'image') {
      const { file } = payload;
      return uploadFileList([file]);
    }

    primitiveExhaustiveCheck(type);
  };

  const onTriggerAction: ActionBarProps['onTriggerAction'] = props => {
    if (props.sync) {
      return onTriggerSyncAction(props);
    }
    return onTriggerAsyncAction(props);
  };

  const ref = useRef<HTMLTextAreaElement>(null);
  const dragTargetRef = useRef<HTMLDivElement>(null);

  const onUploadAllSuccess = useEventCallback(
    ({ url, fileName }: { url: string; fileName: string }) => {
      handleInsertText(
        getMarkdownImageLink({
          fileName,
          link: url,
        }),
      );
    },
  );

  // Determine whether to use the built-in upload method or customize
  const selectUploadMethod = () => {
    if (customUpload) {
      return customUpload({
        onUploadAllSuccess,
      });
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
      return useUpload({
        getUserId,
        onUploadAllSuccess,
      });
    }
  };
  const { uploadFileList, uploadState } = selectUploadMethod();

  const { isDragOver } = useDragAndPasteUpload({
    ref: dragTargetRef,
    onUpload: fileList => {
      const file = fileList.at(0);
      if (!file) {
        return;
      }
      onTriggerAction({ type: 'image', sync: false, payload: { file } });
    },
    disableDrag: Boolean(uploadState),
    disablePaste: Boolean(uploadState),
    fileLimit: 1,
    maxFileSize: MAX_FILE_SIZE,
    isFileFormatValid: getIsFileFormatValid,
    getExistingFileCount: () => 0,
    closeDelay: undefined,
    invalidFormatMessage: I18n.t('file_format_not_supported'),
    invalidSizeMessage: getFileSizeReachLimitI18n(),
    fileExceedsMessage: I18n.t('files_exceeds_limit'),
  });

  const [wrapInsertionIndex, setWrapInsertionIndex] = useState<number | null>(
    null,
  );

  useLayoutEffect(() => {
    if (wrapInsertionIndex === null || !ref.current) {
      return;
    }

    ref.current.selectionStart = wrapInsertionIndex;
    ref.current.selectionEnd = wrapInsertionIndex;
    setWrapInsertionIndex(null);
  }, [ref.current, wrapInsertionIndex, value]);
  console.log('outter value', { value });

  const onTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = e => {
    console.log('onTextareaChange', { value: e.target.value });

    onChange(e.target.value);
  };

  const handleInsertText = (insertText: string) => {
    if (!ref.current) {
      return;
    }
    ref.current.focus();
    const { selectionEnd } = ref.current;
    /**
     * When the text is selected, click the action bar to insert the content at the end of the text
     */
    console.log('handleInsertText', { value, insertText, selectionEnd });

    const insertTextAtPosition = getInsertTextAtPosition({
      text: value,
      insertText,
      position: selectionEnd,
    });
    onChange(insertTextAtPosition);
    setWrapInsertionIndex(selectionEnd + insertText.length);
  };

  return {
    textAreaRef: ref,
    onTextareaChange,
    onTriggerAction,
    dragTargetRef,
    uploadState,
    isDragOver,
  };
};
