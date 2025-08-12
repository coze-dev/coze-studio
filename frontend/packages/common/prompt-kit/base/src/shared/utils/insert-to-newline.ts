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

export const insertToNewline = async ({
  editor,
  prompt,
}: {
  editor?: EditorAPI;
  prompt: string;
}): Promise<string> => {
  if (!editor) {
    return '';
  }
  const { state } = editor.$view;
  const isDocEmpty = state.doc.length === 0;
  const insertPrompt = isDocEmpty ? prompt : `\n${prompt}`;
  const selection = isDocEmpty
    ? undefined
    : {
        anchor: state.doc.length,
        head: state.doc.length + insertPrompt.length,
      };

  editor.$view.dispatch({
    changes: {
      from: state.doc.length,
      to: state.doc.length,
      insert: insertPrompt,
    },
    selection,
    scrollIntoView: true,
  });
  // Wait for the next microtask cycle to ensure that the status has been updated
  await Promise.resolve();

  // Use the updated state to get the latest document content
  const newDoc = editor.$view.state.doc.toString();

  // Insert to new line
  // Note: This operation will trigger a chrome bug in advance, resulting in a crash
  editor.focus();
  return newDoc;
};
