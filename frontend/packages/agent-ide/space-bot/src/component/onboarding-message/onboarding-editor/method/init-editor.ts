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

import type { RefObject } from 'react';

import type { Editor } from '@coze-common/md-editor-adapter';
import { md2html } from '@coze-common/md-editor-adapter';

export interface InitEditorByPrologueProps {
  prologue: string;
  editorRef: RefObject<Editor>;
}
export const initEditorByPrologue = (props: InitEditorByPrologueProps) => {
  const { prologue, editorRef } = props;
  const htmlContent = md2html(prologue);
  editorRef.current?.setHTML(htmlContent);
};
