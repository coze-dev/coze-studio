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

import { createContext, useContext } from 'react';

export enum EditorTheme {
  Light = 'light',
  Dark = 'dark',
}

interface EditorThemeState {
  editorTheme: EditorTheme;
  setEditorTheme: (next: EditorTheme) => void;
  isDarkTheme: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const EditorThemeContext = createContext<EditorThemeState>({
  editorTheme: EditorTheme.Light,
  setEditorTheme: _next => {
    console.log(_next);
  },
  isDarkTheme: false,
});

export const useEditorThemeState = () => useContext(EditorThemeContext);
