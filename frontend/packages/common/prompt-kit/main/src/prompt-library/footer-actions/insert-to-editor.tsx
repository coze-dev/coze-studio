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
import { insertToNewline } from '@coze-common/prompt-kit-base/shared';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

export const InsertToEditor = (props: {
  outerEditor: EditorAPI;
  prompt: string;
  onInsertPrompt: (prompt: string) => void;
  onCancel: (e: React.MouseEvent) => void;
}) => {
  const { outerEditor, prompt, onInsertPrompt, onCancel } = props;
  return (
    <Button
      disabled={!prompt}
      onClick={async e => {
        const insertPrompt = await insertToNewline({
          editor: outerEditor,
          prompt,
        });
        onInsertPrompt(insertPrompt);
        onCancel?.(e);
      }}
    >
      {I18n.t('prompt_resource_insert_prompt')}
    </Button>
  );
};
