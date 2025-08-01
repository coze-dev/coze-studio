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

import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { EditorSelection } from '@codemirror/state';

import { TemplateParser } from '../../shared/utils/template-parser';
const templateParser = new TemplateParser({ mark: 'InputSlot' });

export const insertInputSlot = (
  editor: EditorAPI,
  options?: {
    mode?: 'input' | 'configurable';
    placeholder?: string;
  },
) => {
  if (!editor) {
    return;
  }
  const {
    mode = 'input',
    placeholder = I18n.t('edit_block_guidance_text_placeholder'),
  } = options ?? {};
  const { selection } = editor.$view.state;
  const selectionRange = editor.$view.state.selection.main;
  const content = editor.$view.state.sliceDoc(
    selectionRange.from,
    selectionRange.to,
  );
  const extractedContent = templateParser.extractTemplateContent(content);
  const { open, template, textContent } = templateParser.generateTemplateJson({
    content: extractedContent,
    data: {
      placeholder,
      mode,
    },
  });
  const from = selectionRange.from + open.length;
  const to = from + textContent.length;
  editor.$view.dispatch({
    changes: {
      from: selectionRange.from,
      to: selectionRange.to,
      insert: template,
    },
  });
  setTimeout(() => {
    editor.$view.dispatch({
      selection: selection.replaceRange(EditorSelection.range(from, to)),
    });
  }, 100);
};
