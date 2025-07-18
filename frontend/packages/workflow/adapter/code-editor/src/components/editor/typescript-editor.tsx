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

import React, { useEffect } from 'react';

import { Renderer, EditorProvider } from '@coze-editor/editor/react';
import { EditorView } from '@codemirror/view';

import { type EditorOtherProps, type EditorProps } from '../../interface';
import {
  initInputAndOutput,
  initTypescriptServer,
} from './typescript-editor-utils';
import preset from './preset';

initTypescriptServer();

export const TypescriptEditor = (props: EditorProps & EditorOtherProps) => {
  const {
    defaultContent,
    uuid,
    readonly,
    height,
    didMount,
    onChange,
    defaultLanguage,
    input,
    output,
  } = props;

  const uri = `file:///ts_editor_${uuid}.ts`;

  useEffect(() => {
    initInputAndOutput(input, output, uuid);
  }, [uuid]);

  return (
    <EditorProvider>
      <Renderer
        plugins={preset}
        domProps={{
          style: {
            height: 'calc(100% - 48px)',
          },
        }}
        didMount={api => {
          didMount?.(api);
          api.$on('change', ({ value }) => {
            onChange?.(value, defaultLanguage);
          });
        }}
        defaultValue={defaultContent}
        extensions={[
          EditorView.theme({
            '&.cm-focused': {
              outline: 'none',
            },
            '&.cm-editor': {
              height: height || 'unset',
            },
            '.cm-content': {
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            },
            '.cm-content *': {
              fontFamily: 'inherit',
            },
          }),
        ]}
        options={{
          uri,
          languageId: 'typescript',
          theme: 'code-editor-dark',
          height,
          readOnly: readonly,
          editable: !readonly,
          fontSize: 12,
          tabSize: 4,
        }}
      />
    </EditorProvider>
  );
};
