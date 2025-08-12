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

import { useEffect, useState } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { syntaxTree } from '@codemirror/language';

export const useSelectionInJinjaRaw = () => {
  const editor = useEditor<EditorAPI>();
  const [inJinjaRaw, setInJinjaRaw] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const checkInJinjaRaw = () => {
      const selection = editor.getSelection();
      if (!selection) {
        setInJinjaRaw(false);
        return;
      }

      const { state } = editor.$view;
      const tree = syntaxTree(state);
      const cursor = tree.cursor();

      let isInRaw = false;
      do {
        if (cursor.name === 'RawText') {
          const isSelectionWithinNode =
            cursor.from <= selection.from && cursor.to >= selection.to;
          if (isSelectionWithinNode) {
            isInRaw = true;
            break;
          }
        }
      } while (cursor.next());

      setInJinjaRaw(isInRaw);
    };

    editor.$on('viewUpdate', checkInJinjaRaw);

    // Initial inspection
    checkInJinjaRaw();

    return () => {
      editor.$off('viewUpdate', checkInJinjaRaw);
    };
  }, [editor]);

  return inJinjaRaw;
};
