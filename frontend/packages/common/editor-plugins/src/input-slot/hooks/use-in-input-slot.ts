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
import { type ViewUpdate } from '@codemirror/view';

import { TemplateParser } from '../../shared/utils/template-parser';

const templateParser = new TemplateParser({ mark: 'InputSlot' });
export const useCursorInInputSlot = () => {
  const editor = useEditor<EditorAPI>();
  const [inInputSlot, setInInputSlot] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleViewUpdate = (update: ViewUpdate) => {
      if (update.selectionSet) {
        const markRangeInfo = templateParser.getSelectionInMarkNodeRange(
          update.state.selection.main,
          update.state,
        );
        if (markRangeInfo) {
          setInInputSlot(true);
          return;
        }
        setInInputSlot(false);
      }
    };
    editor.$on('viewUpdate', handleViewUpdate);
    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor]);

  return inInputSlot;
};

export const useSelectionInInputSlot = () => {
  const editor = useEditor<EditorAPI>();
  const [inInputSlot, setInInputSlot] = useState(false);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleViewUpdate = (update: ViewUpdate) => {
      if (!update.state.selection.main.empty) {
        const markRangeInfo = templateParser.getSelectionInMarkNodeRange(
          update.state.selection.main,
          update.state,
        );
        if (markRangeInfo) {
          setInInputSlot(true);
          return;
        }
        setInInputSlot(false);
      }
    };
    editor.$on('viewUpdate', handleViewUpdate);
    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor]);
  return inInputSlot;
};
