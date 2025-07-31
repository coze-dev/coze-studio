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

import { Suspense, lazy } from 'react';

import { type EditorProps, type DiffEditorProps } from '@monaco-editor/react';

import { loader } from './loader';

const LazyEditor = lazy(async () => {
  await loader.config();
  const { Editor } = await import('./monaco-editor');
  return {
    default: Editor,
  };
});
const LazyDiffEditor = lazy(async () => {
  await loader.config();
  const { DiffEditor } = await import('./monaco-editor');
  return {
    default: DiffEditor,
  };
});

const FallbackComponent = <div>Loading Editor...</div>;
export const Editor = (props: EditorProps) => (
  <Suspense fallback={FallbackComponent}>
    <LazyEditor {...props} />
  </Suspense>
);

export const DiffEditor = (props: DiffEditorProps) => (
  <Suspense fallback={FallbackComponent}>
    <LazyDiffEditor {...props} />
  </Suspense>
);
