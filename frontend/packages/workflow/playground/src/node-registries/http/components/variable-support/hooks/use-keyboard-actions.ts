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

import { useEffect } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-universal';

import { getOptionInfoFromDOM } from '../utils';
import { useOptionsOperations } from './use-options-operations';
import { useKeyboard } from './use-keyboard';

export const useKeyboardActions = ({
  dropDownVisible,
  editorRef,
  interpolationContent,
  dropdownRef,
  variableMenuRef,
  openMenu,
  setActiveOptionHover,
  setTreeVisible,
  isInputDropdownOpen,
  applyNode,
}) => {
  const editor = useEditor<EditorAPI>();

  const isOptionsVisible = getOptionInfoFromDOM(
    variableMenuRef.current?.treeContainerRef,
    '.semi-tree-option-list .semi-tree-option',
  );

  /**
   * Disable the default behavior of ArrowUp/ArrowDown/Enter when the recommendation panel appears
   * Change up and down keys to switch recommendations
   * Left-click to close the variable list, right-click to open the variable list, and press Enter to insert.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (dropDownVisible) {
      editor.disableKeybindings([
        'ArrowUp',
        'ArrowLeft',
        'ArrowRight',
        'ArrowDown',
      ]);
    }

    // When the variable list is detected, disable carriage return
    if (isOptionsVisible) {
      editor.disableKeybindings([
        'Enter',
        'ArrowUp',
        'ArrowLeft',
        'ArrowRight',
        'ArrowDown',
      ]);
    }

    if (!dropDownVisible && !isOptionsVisible) {
      editor.disableKeybindings([]);
    }
  }, [dropDownVisible, editor, isOptionsVisible]);

  const { prev, next, left, right, apply } = useOptionsOperations({
    editorRef,
    context: interpolationContent,
    dropdownContext: {
      setActiveOptionHover,
      dropdownRef,
      variableMenuRef,
    },
    setTreeVisible,
    isInputDropdownOpen,
    applyNode,
  });

  // Press the up and down keys to switch the recommended items, and press Enter to fill in.
  useKeyboard(dropDownVisible, {
    ArrowUp: prev,
    ArrowDown: next,
    ArrowLeft: left,
    ArrowRight: right,
    Enter: apply,
  });

  // ESC Close
  useKeyboard(dropDownVisible, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Escape() {
      openMenu(false);
      setTreeVisible(false);
    },
  });
};
