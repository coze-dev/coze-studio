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
 
import { type ModalProps } from '@coze-arch/coze-design';

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
