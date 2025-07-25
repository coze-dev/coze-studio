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
 
import { Editor } from 'slate';

import type { CommentEditorCommand } from '../type';
import type { CommentEditorModel } from '../model';
import { CommentEditorBlockFormat } from '../constant';

// 定义块前缀模式和对应的格式
const blockPrefixConfig: Array<[RegExp, CommentEditorBlockFormat]> = [
  [/^#$/, CommentEditorBlockFormat.HeadingOne],
  [/^##$/, CommentEditorBlockFormat.HeadingTwo],
  [/^###$/, CommentEditorBlockFormat.HeadingThree],
  [/^>$/, CommentEditorBlockFormat.Blockquote],
  [/^-$/, CommentEditorBlockFormat.BulletedList],
  [/^\*$/, CommentEditorBlockFormat.BulletedList],
  [/^1\.$/, CommentEditorBlockFormat.NumberedList],
];

// 删除文本的函数
const deleteText = (model: CommentEditorModel, text: string): void => {
  Array.from(text).forEach(() => {
    Editor.deleteBackward(model.editor, { unit: 'character' });
  });
};

// 处理块前缀的函数
const handleBlockPrefix = (
  model: CommentEditorModel,
  text: string,
): boolean => {
  const matchedConfig = blockPrefixConfig.find(([pattern]) =>
    pattern.test(text),
  );

  if (matchedConfig) {
    const [, format] = matchedConfig;
    deleteText(model, text);
    model.markBlock(format);
    return true;
  }

  return false;
};

export const blockPrefixCommand: CommentEditorCommand = {
  key: ' ',
  exec: ({ model, event }) => {
    // 检查是否正在输入拼音
    if (event.nativeEvent.isComposing) {
      return;
    }

    const { before: beforeText } = model.getBlockText();
    if (!beforeText) {
      return;
    }

    if (handleBlockPrefix(model, beforeText)) {
      event.preventDefault();
    }
  },
};
