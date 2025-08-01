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

import { useState, type MutableRefObject, type RefObject } from 'react';

import { reporter } from '@coze-arch/logger';

import type { OnboardingEditorAction } from '../index';

export const useModalEditorSubmit = (
  modalEditor: MutableRefObject<OnboardingEditorAction | null>,
  ref: RefObject<OnboardingEditorAction>,
) => {
  const [isModalEditorSubmitting, setIsModalEditorSubmitting] = useState(false);
  const [editorImageUploadNum, setEditorImageUploadNum] = useState(0);
  const [editorImageTotalNum, setEditorImageTotalNum] = useState(0);

  const submitEditor = async () => {
    try {
      setIsModalEditorSubmitting(true);
      const { checkAndGetMarkdown } = await import(
        '@coze-common/md-editor-adapter'
      );
      const obj = await checkAndGetMarkdown({
        editor: modalEditor.current.getEditor(),
        validate: false,
        onImageUploadProgress: (total, count) => {
          setEditorImageUploadNum(count);
          setEditorImageTotalNum(total);
        },
      });
      if (!obj) {
        return;
      }
      const content = modalEditor.current?.getEditor()?.getContent();
      (ref as RefObject<OnboardingEditorAction>)?.current
        ?.getEditor()
        ?.setContent(content);
      setIsModalEditorSubmitting(false);
    } catch (error) {
      setIsModalEditorSubmitting(false);
      reporter.error({
        message: 'onboarding-editor-modal-checkAndGetMarkdown-error',
        error,
      });
    }
  };

  return {
    submitEditor,
    isModalEditorSubmitting,
    editorImageUploadNum,
    editorImageTotalNum,
  };
};
