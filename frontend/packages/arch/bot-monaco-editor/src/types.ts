export type { IRange, editor } from 'monaco-editor';

export type { Monaco, OnMount } from '@monaco-editor/react';

export type MonacoEditor =
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  typeof import('monaco-editor/esm/vs/editor/editor.api');

export { type EditorProps, type DiffEditorProps } from '@monaco-editor/react';
