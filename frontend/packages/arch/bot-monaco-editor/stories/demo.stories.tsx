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
