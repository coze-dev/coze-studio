import { useContext } from 'react';

import { PromptEditorKitContext, PromptEditorKitProvider } from './context';

export const usePromptEditor = () => useContext(PromptEditorKitContext);

export { PromptEditorKitProvider };
