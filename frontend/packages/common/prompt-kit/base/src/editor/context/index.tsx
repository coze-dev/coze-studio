import { type PropsWithChildren } from 'react';

import { EditorProvider } from '@coze-editor/editor/react';

export const PromptEditorProvider: React.FC<PropsWithChildren> = ({
  children,
}) => <EditorProvider>{children}</EditorProvider>;
