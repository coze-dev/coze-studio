import React from 'react';

import { Renderer, EditorProvider } from '@flow-lang-sdk/editor/react';
import preset, { languages } from '@flow-lang-sdk/editor/preset-code';
import { python } from '@flow-lang-sdk/editor/language-python';
import { EditorView } from '@codemirror/view';

import { type EditorOtherProps, type EditorProps } from '../../interface';

languages.register('python', python);

export const PythonEditor = (props: EditorProps & EditorOtherProps) => {
  const {
    defaultContent,
    uuid,
    readonly,
    height,
    didMount,
    onChange,
    defaultLanguage,
  } = props;

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
          uri: `file:///py_editor_${uuid}.py`,
          languageId: 'python',
          theme: 'code-editor-dark',
          height,
          readOnly: readonly,
          fontSize: 12,
        }}
      />
    </EditorProvider>
  );
};
