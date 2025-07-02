import { type PropsWithChildren, createContext, useState } from 'react';

import { type PromptEditorKitContextProps } from './type';

export const PromptEditorKitContext =
  createContext<PromptEditorKitContextProps>({
    getPromptEditor: () => undefined,
    setEditorInstance: () => 0,
    promptEditor: undefined,
  });

export const PromptEditorKitProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [promptEditor, setPromptEditor] =
    useState<PromptEditorKitContextProps['promptEditor']>();
  const setEditorInstance: PromptEditorKitContextProps['setEditorInstance'] =
    editor => {
      setPromptEditor(editor);
    };
  return (
    <PromptEditorKitContext.Provider
      value={{
        getPromptEditor: () => promptEditor,
        promptEditor,
        setEditorInstance,
      }}
    >
      {children}
    </PromptEditorKitContext.Provider>
  );
};
