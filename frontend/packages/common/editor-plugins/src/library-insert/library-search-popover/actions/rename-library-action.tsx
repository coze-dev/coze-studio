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

import { type RefObject } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { type ILibraryItem } from '../../types';

interface RenameLibraryActionProps {
  editorRef: RefObject<EditorAPI>;
  library: ILibraryItem;
  range: {
    left: number;
    right: number;
  };
  onRename?: (pos: { from: number; to: number }) => void;
}
export const RenameLibraryAction = ({
  editorRef,
  library,
  range,
  onRename,
}: RenameLibraryActionProps) => {
  const handleRename = () => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current?.$view.dispatch({
      changes: {
        from: range.left,
        to: range.right,
        insert: library.name,
      },
    });
    onRename?.({ from: range.left, to: range.right });
  };
  return (
    <Button onClick={handleRename} color="primary" size="small">
      {I18n.t('edit_block_api_rename')}
    </Button>
  );
};
