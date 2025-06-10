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
