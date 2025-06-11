import React, { useEffect } from 'react';

import { Renderer, EditorProvider } from '@flow-lang-sdk/editor/react';
import preset from '@flow-lang-sdk/editor/preset-code';
import { EditorView } from '@codemirror/view';

import { type EditorOtherProps, type EditorProps } from '../../interface';
import {
  initInputAndOutput,
  initTypescriptServer,
} from './typescript-editor-utils';

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
          fontSize: 12,
        }}
      />
    </EditorProvider>
  );
};
