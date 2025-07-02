import React, { useRef, useCallback } from 'react';

import type { OnMount } from '../src/types';
import { Editor, DiffEditor } from '../src';
export function DemoComponent(): JSX.Element {
  const editorRef = useRef({});

  const handleEditorDidMount = useCallback<OnMount>(editor => {
    editorRef.current = editor;
  }, []);
  return (
    <div>
      Editor:
      <Editor
        width="50vw"
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onMount={handleEditorDidMount}
      />
      DiffEditor:
      <DiffEditor
        width="50vw"
        height="90vh"
        language="javascript"
        original="// the original code"
        modified="// the modified code"
      />
    </div>
  );
}

export default {
  title: 'MonacoEditorDemo',
  component: DemoComponent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
};

export const Base = {
  args: {},
};
