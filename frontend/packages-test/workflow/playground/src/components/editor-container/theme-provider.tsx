import { useState, useMemo } from 'react';

import {
  EditorThemeContext,
  EditorTheme,
} from '@/hooks/use-editor-theme-state';

export const EditorThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [editorTheme, setEditorTheme] = useState<EditorTheme>(
    EditorTheme.Light,
  );

  const isDarkTheme = useMemo(
    () => editorTheme === EditorTheme.Dark,
    [editorTheme],
  );

  return (
    <EditorThemeContext.Provider
      value={{ editorTheme, setEditorTheme, isDarkTheme }}
    >
      {children}
    </EditorThemeContext.Provider>
  );
};
