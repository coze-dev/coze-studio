import { type ModalProps } from '@coze/coze-design';

export interface PromptContextInfo {
  botId?: string;
  name?: string;
  description?: string;
  contextHistory?: string;
}

export interface PromptConfiguratorModalProps extends ModalProps {
  mode: 'create' | 'edit' | 'info';
  editId?: string;
  isPersonal?: boolean;
  spaceId: string;
  botId?: string;
  projectId?: string;
  workflowId?: string;
  defaultPrompt?: string;
  canEdit?: boolean;
  /** 用于埋点: 页面来源 */
  source: string;
  enableDiff?: boolean;
  promptSectionConfig?: {
    /** 提示词输入框的 placeholder */
    editorPlaceholder?: React.ReactNode;
    /** 提示词划词actions */
    editorActions?: React.ReactNode;
    /** 头部 actions */
    headerActions?: React.ReactNode;
    /** 提示词输入框的 active line placeholder */
    editorActiveLinePlaceholder?: React.ReactNode;
    /** 提示词输入框的 extensions */
    editorExtensions?: React.ReactNode;
  };
  /** 最外层容器插槽 */
  containerAppendSlot?: React.ReactNode;
  importPromptWhenEmpty?: string;
  getConversationId?: () => string | undefined;
  getPromptContextInfo?: () => PromptContextInfo;
  onUpdateSuccess?: (mode: 'create' | 'edit' | 'info', id?: string) => void;
  onDiff?: ({
    prompt,
    libraryId,
  }: {
    prompt: string;
    libraryId: string;
  }) => void;
}
