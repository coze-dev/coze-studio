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

import { createRenderer, option } from '@coze-editor/editor/react';
import universal from '@coze-editor/editor/preset-universal';
import { mixLanguages } from '@coze-editor/editor';
import { keymap, EditorView } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

const RawEditorTheme = EditorView.theme({
  '&.cm-editor': {
    outline: 'none',
  },
  '&.cm-content': {
    wordBreak: 'break-all',
  },
});

const minHeightOption = (value?: string | number) =>
  EditorView.theme({
    '.cm-content, .cm-gutter, .cm-right-gutter': {
      minHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
          ? value
          : 'unset',
    },
  });

const lineHeightOption = (value?: string | number) =>
  EditorView.theme({
    '.cm-content, .cm-gutter, .cm-right-gutter': {
      lineHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
          ? value
          : 'unset',
    },
  });

const extensions = [
  mixLanguages({}),
  RawEditorTheme,
  // ... Other extensions
  history(),
  keymap.of([...defaultKeymap, ...historyKeymap]),
];

export const TextEditor = createRenderer(
  [
    ...universal,
    option('minHeight', minHeightOption),
    option('lineHeight', lineHeightOption),
  ],
  extensions,
);
