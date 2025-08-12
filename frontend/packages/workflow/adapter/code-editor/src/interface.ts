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

import { type ReactNode } from 'react';

import type {
  ViewVariableTreeNode,
  ViewVariableType,
} from '@coze-workflow/base';

import { type EditorAPI } from './components/editor/preset';

export interface Input {
  name?: string;
  type?: ViewVariableType;
  children?: ViewVariableTreeNode[];
}

export interface Output {
  name?: string;
  type?: ViewVariableType;
  children?: Output[];
}

// Javascript is historical data, currently only python | typescript is available.
export type LanguageType = 'python' | 'typescript' | 'javascript';

export interface PreviewerProps {
  content: string;
  language: LanguageType;
  height?: number;
}

export interface EditorProps {
  defaultContent?: string;
  uuid: string;
  defaultLanguage: LanguageType;
  spaceId?: string;
  height?: string;
  width?: string;
  title?: string;
  readonly?: boolean;
  input?: Input[];
  output?: Output[];
  region?: string;
  locale?: string;
  onClose?: () => void;
  onChange?: (code: string, language: LanguageType) => void;
  languageTemplates?: Array<{
    language: 'typescript' | 'python';
    displayName: string;
    template: string;
  }>;
  onTestRun?: () => void;
  testRunIcon?: ReactNode;
  /**
   * @Deprecated onTestRunStateChange has expired and is not used online
   */
  onTestRunStateChange?: (status: string) => void;
}

export interface EditorOtherProps {
  didMount?: (api: EditorAPI) => void;
  language?: LanguageType;
}

export enum ModuleDetectionKind {
  /**
   * Files with imports, exports and/or import.meta are considered modules
   */
  Legacy = 1,
  /**
   * Legacy, but also files with jsx under react-jsx or react-jsxdev and esm mode files under moduleResolution: node16+
   */
  Auto = 2,
  /**
   * Consider all non-declaration files modules, regardless of present syntax
   */
  Force = 3,
}
