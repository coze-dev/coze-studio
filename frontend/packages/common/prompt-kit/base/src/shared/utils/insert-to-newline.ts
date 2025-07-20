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
  // 等待下一个微任务周期，确保状态已更新
  await Promise.resolve();

  // 使用更新后的state获取最新文档内容
  const newDoc = editor.$view.state.doc.toString();

  // 插入到新一行
  // 注意：该操作提前会触发 chrome bug 导致崩溃问题
  editor.focus();
  return newDoc;
};
