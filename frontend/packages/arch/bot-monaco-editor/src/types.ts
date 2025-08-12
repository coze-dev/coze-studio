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

export type { IRange, editor } from 'monaco-editor';

export type { Monaco, OnMount } from '@monaco-editor/react';

export type MonacoEditor =
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  typeof import('monaco-editor/esm/vs/editor/editor.api');

export { type EditorProps, type DiffEditorProps } from '@monaco-editor/react';
