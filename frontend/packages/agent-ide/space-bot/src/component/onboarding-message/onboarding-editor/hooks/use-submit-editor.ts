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

import { useShallow } from 'zustand/react/shallow';
import { trim } from 'lodash-es';
import { produce } from 'immer';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';

import {
  getEditorLines,
  removeLastLineMarkerOnChange,
} from '@/component/onboarding-message/onboarding-editor/method/editor-content-helper';

import type { OnboardingEditorContext } from '../index';

export const useSubmitEditor = () => {
  const { updateSkillOnboarding } = useBotSkillStore(
    useShallow(state => ({
      updateSkillOnboarding: state.updateSkillOnboarding,
    })),
  );
  const onSubmit = (context: OnboardingEditorContext) => {
    const { api, editorRef } = context;
    if (!api.current || !editorRef.current) {
      return;
    }

    if (context.props.plainText) {
      const content = editorRef.current.getText();
      updateSkillOnboarding(pre =>
        produce(pre, draft => {
          draft.prologue = trim(String(content));
        }),
      );
      return;
    }

    api.current.validate().then(async () => {
      const { checkAndGetMarkdown } = await import(
        '@coze-common/md-editor-adapter'
      );
      const obj = await checkAndGetMarkdown({
        editor: editorRef.current,
        validate: false,
      });
      if (!obj) {
        return;
      }
      const { content } = obj;
      const editorLines = getEditorLines(editorRef.current);
      const handledContent = removeLastLineMarkerOnChange({
        editorLines,
        text: content,
      });

      updateSkillOnboarding(pre =>
        produce(pre, draft => {
          draft.prologue = handledContent;
        }),
      );
    });
  };

  return [onSubmit];
};
