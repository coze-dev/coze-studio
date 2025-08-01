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

import { createTheme } from '@coze-editor/editor/preset-code';
import { type Extension } from '@codemirror/state';

const colors = {
  background: '#151B27',
};

export const createDarkTheme: () => Extension = () =>
  createTheme({
    variant: 'dark',
    settings: {
      background: colors.background,
      foreground: '#fff',
      caret: '#AEAFAD',
      selection: '#d9d9d942',
      gutterBackground: colors.background,
      gutterForeground: '#FFFFFF63',
      gutterBorderColor: 'transparent',
      gutterBorderWidth: 0,
      lineHighlight: '#272e3d36',
      bracketColors: ['#FFEF61', '#DD99FF', '#78B0FF'],
      tooltip: {
        backgroundColor: '#363D4D',
        color: '#fff',
        border: 'none',
      },
      completionItemHover: {
        backgroundColor: '#FFFFFF0F',
      },
      completionItemSelected: {
        backgroundColor: '#FFFFFF17',
      },
      completionItemIcon: {
        color: '#FFFFFFC9',
      },
      completionItemLabel: {
        color: '#FFFFFFC9',
      },
      completionItemDetail: {
        color: '#FFFFFF63',
      },
    },
    styles: [],
  });
