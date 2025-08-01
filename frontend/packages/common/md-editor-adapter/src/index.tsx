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

/* eslint-disable @typescript-eslint/no-extraneous-class */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { lazy } from 'react';

import { type EditorInputProps } from './types';
export {
  DEFAULT_ZONE,
  displayType,
  type EditorInputProps,
  type EditorHandle,
  type Delta,
  type Editor,
  type IRenderContext,
  ToolbarItemEnum,
  ZoneDelta,
  IApplyMetadata,
  DeltaSet,
  DeltaSetOptions,
  EditorEventType,
} from './types';

export const Text: React.FC<any> = () => null;

export const ToolbarButton: React.FC<any> = () => null;

export class Plugin {}

export {
  md2html,
  checkAndGetMarkdown,
  delta2md,
  normalizeSchema,
} from './utils';

const LazyEditorFullInput: React.FC<EditorInputProps> = lazy(() =>
  import('./editor').then(module => ({
    default: module.EditorInput,
  })),
);

const LazyEditorFullInputInner: React.FC<EditorInputProps> = lazy(() =>
  import('./editor').then(module => ({
    default: module.EditorFullInputInner,
  })),
);

export { LazyEditorFullInput, LazyEditorFullInputInner };
