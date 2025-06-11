import React, { type FC, lazy, Suspense, useMemo } from 'react';

import { type EditorOtherProps, type EditorProps } from '../../interface';

const LazyPythonEditor: FC<EditorProps> = lazy(async () => {
  const { PythonEditor } = await import('./python-editor');
  return { default: PythonEditor };
});

const PythonEditor: FC<EditorProps> = props => (
  <Suspense>
    <LazyPythonEditor {...props} />
  </Suspense>
);

const LazyTypescriptEditor: FC<EditorProps> = lazy(async () => {
  const { TypescriptEditor } = await import('./typescript-editor');
  return { default: TypescriptEditor };
});

const TypescriptEditor: FC<EditorProps> = props => (
  <Suspense>
    <LazyTypescriptEditor {...props} />
  </Suspense>
);

export const Editor = (props: EditorProps & EditorOtherProps) => {
  const language = useMemo(
    () => props.language || props.defaultLanguage,
    [props.defaultLanguage, props.language],
  );

  if (language === 'python') {
    return <PythonEditor {...props} />;
  }

  return <TypescriptEditor {...props} />;
};
