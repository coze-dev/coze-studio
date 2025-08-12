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

import type { CommentEditorCommand } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export const clearFormatEnterCommand: CommentEditorCommand = {
  key: 'Enter',
  shift: false,
  exec: ({ model, event }) => {
    // Check if pinyin is being entered.
    if (event.nativeEvent.isComposing) {
      return;
    }

    const isEmptyBlock = !model.getBlockText().text;
    const hasBlockFormat = !model.isBlockMarked(
      CommentEditorBlockFormat.Paragraph,
    );

    if (!isEmptyBlock || !hasBlockFormat) {
      return;
    }

    event.preventDefault();
    model.clearFormat();
  },
};

export const clearFormatBackspaceCommand: CommentEditorCommand = {
  key: 'Backspace',
  shift: false,
  exec: ({ model, event }) => {
    const isAtBlockStart = !model.getBlockText().before;
    const hasBlockFormat = !model.isBlockMarked(
      CommentEditorBlockFormat.Paragraph,
    );

    if (!isAtBlockStart || !hasBlockFormat) {
      return;
    }

    event.preventDefault();
    model.clearFormat();
  },
};
