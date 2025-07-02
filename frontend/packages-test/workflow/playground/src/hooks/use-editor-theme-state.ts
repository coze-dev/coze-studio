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
