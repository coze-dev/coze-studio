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
import { IconCozCopy } from '@coze-arch/coze-design/icons';
import { Button, Toast } from '@coze-arch/coze-design';
export const CopyAction = () => {
  const editor = useEditor<EditorAPI>();
  return (
    <Button
      icon={<IconCozCopy />}
      color="primary"
      size="small"
      className="w-6 h-6"
      onClick={() => {
        const text = editor?.$view.state.doc.toString();
        navigator.clipboard.writeText(text);
        Toast.success(I18n.t('prompt_library_prompt_copied_successfully'));
      }}
    />
  );
};
