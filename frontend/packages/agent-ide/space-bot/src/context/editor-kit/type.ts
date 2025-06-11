import { type Editor } from '@coze-common/md-editor-adapter';

export interface PromptEditorKitContextProps {
  promptEditor: Editor | undefined;
  getPromptEditor: () => Editor | undefined;
  setEditorInstance: (editor: Editor) => void;
}
