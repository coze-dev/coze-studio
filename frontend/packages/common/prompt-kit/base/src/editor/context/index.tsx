import { type PropsWithChildren } from 'react';

import { EditorProvider } from '@flow-lang-sdk/editor/react';

export const PromptEditorProvider: React.FC<PropsWithChildren> = ({
  children,
}) => <EditorProvider>{children}</EditorProvider>;
