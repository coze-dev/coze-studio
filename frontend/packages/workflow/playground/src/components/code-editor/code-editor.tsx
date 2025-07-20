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
import preset, { languages, themes } from '@coze-editor/editor/preset-code';
import { shell } from '@coze-editor/editor/language-shell';
import { json } from '@coze-editor/editor/language-json';
import { mixLanguages } from '@coze-editor/editor';
import { EditorView } from '@codemirror/view';

import { cozeLight } from './themes/coze-light';
import { cozeDark } from './themes/coze-dark';

// 注册语言
languages.register('json', {
  // mixLanguages 用于解决 「插值也使用了括号，导致无法正确高亮」的问题
  language: mixLanguages({
    outerLanguage: json.language,
  }),
  languageService: json.languageService,
});

languages.register('shell', shell);

// 注册主题
themes.register('coze-light', cozeLight);
themes.register('coze-dark', cozeDark);

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
    '&.cm-editor': {
      minHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });

const maxHeightOption = (value?: string | number) =>
  EditorView.theme({
    '&.cm-editor': {
      maxHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });

const heightOption = (value?: string | number) =>
  EditorView.theme({
    '&.cm-editor': {
      height:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });

const paddingOption = (value?: string | number) =>
  EditorView.theme({
    '&.cm-editor': {
      padding:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });

const borderRadiusOption = (value?: string | number) =>
  EditorView.theme({
    '&.cm-editor, .cm-gutters': {
      borderRadius:
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

function createStyleOptions() {
  return [
    option('minHeight', minHeightOption),
    option('maxHeight', maxHeightOption),
    option('editerHeight', heightOption),
    option('borderRadius', borderRadiusOption),
    option('padding', paddingOption),
    option('lineHeight', lineHeightOption),
  ];
}

const builtinExtensions = [
  EditorView.theme({
    '&.cm-focused': {
      outline: 'none',
    },
    '& *': {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    },
  }),
  EditorView.theme({
    '&.cm-content': {
      wordBreak: 'break-all',
    },
  }),
];

export const CodeEditor = createRenderer(
  [...preset, ...createStyleOptions()],
  builtinExtensions,
);
