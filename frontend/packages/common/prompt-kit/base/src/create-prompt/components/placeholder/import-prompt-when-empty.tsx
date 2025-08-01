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

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';

import { useCreatePromptContext } from '@/create-prompt/context';

export const ImportPromptWhenEmptyPlaceholder = () => {
  const editor = useEditor<EditorAPI>();
  const { props, formApiRef } = useCreatePromptContext() || {};
  const { importPromptWhenEmpty } = props || {};

  return importPromptWhenEmpty ? (
    <div
      className="coz-fg-hglt text-sm cursor-pointer mt-1"
      onClick={() => {
        editor?.$view.dispatch({
          changes: {
            from: 0,
            to: editor.$view.state.doc.length,
            insert: importPromptWhenEmpty,
          },
        });
        formApiRef?.current?.setValue('prompt_text', importPromptWhenEmpty);
      }}
    >
      {I18n.t('creat_new_prompt_import_link')}
    </div>
  ) : null;
};
