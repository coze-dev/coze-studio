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

import { themes } from '@coze-editor/editor/preset-code';

import { convertSchema } from './utils';
import { type PreviewerProps, type EditorProps } from './interface';
import { createDarkTheme } from './components/theme';
import { Previewer } from './components/previewer';
import { BizEditor as Editor } from './components/editor';

themes.register('code-editor-dark', createDarkTheme());

export {
  Previewer,
  Editor,
  type PreviewerProps,
  type EditorProps,
  convertSchema,
};
