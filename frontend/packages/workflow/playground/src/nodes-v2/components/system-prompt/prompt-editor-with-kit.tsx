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

import { type FC, useState, useRef } from 'react';

import classNames from 'classnames';
import { useGlobalVariableServiceState } from '@coze-workflow/variable';
import { NLPromptModal } from '@coze-workflow/resources-adapter';
import { type ExpressionEditorTreeNode } from '@coze-workflow/components';
import { useNodeTestId } from '@coze-workflow/base';
import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { usePromptConfiguratorModal } from '@coze-common/prompt-kit-adapter/create-prompt';
import { usePromptLibraryModal } from '@coze-common/prompt-kit';
import {
  ContentSearchPopover,
  type ContentSearchPopoverProps,
} from '@coze-common/editor-plugins/library-variable-insert';
import {
  type ILibraryItem,
  LibraryBlockWidget,
} from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import {
  Completion,
  Validation,
  HighlightExpressionOnActive,
} from '@coze-common/editor-plugins/expression';
import { I18n } from '@coze-arch/i18n';
import { useFlags } from '@coze-arch/bot-flags';

import { useGlobalState } from '@/hooks';
import { FormCard } from '@/form-extensions/components/form-card';

import { useVariableTree } from '../expression-editor/hooks';
import { type ExpressionEditorProps } from '../expression-editor';
import { focusToAnchor } from './utils';
import { SystemPromptEditor } from './system-prompt-editor';
import { PromptKitBar } from './prompt-kit-bar';

import s from './index.module.less';

interface EditorWithPromptKitProps
  extends ExpressionEditorProps,
    ContentSearchPopoverProps {
  getConversationId: () => string;
  getPromptContextInfo: () => {
    botId?: string | undefined;
    name: string;
    description: string;
  };
  readonly?: boolean;
  onAddLibrary?: (library: ILibraryItem) => void;
  onRename?: () => void;
}

export const EditorWithPromptKit: FC<EditorWithPromptKitProps> = props => {
  const {
    name,
    getConversationId,
    getPromptContextInfo,
    readonly,
    placeholder,
    value,
    onChange,
    libraries = [],
    onAddLibrary,
  } = props;
  const { id, type } = useGlobalVariableServiceState();
  const { getNodeSetterId } = useNodeTestId();
  const dataTestID = getNodeSetterId(name);

  const { spaceId, projectId, workflowId } = useGlobalState();
  const [isFocused, setIsFocused] = useState(false);
  const variableTree: ExpressionEditorTreeNode[] = useVariableTree();
  const editor = useEditor<EditorAPI>();

  const promptValue = useRef<string>(value || '');

  const [FLAGS] = useFlags();
  // Support soon, so stay tuned.
  const isHitLLMPromptSkills = FLAGS['bot.automation.llm_prompt_skills'];

  const { open, node: PromptLibrary } = usePromptLibraryModal({
    spaceId,
    getConversationId,
    projectId,
    workflowId,
    getPromptContextInfo,
    source: 'app_detail_page',
    editor,
    onInsertPrompt: (prompt, info) => props?.onChange(prompt),
  });

  const { open: openCreatePrompt, node: promptConfiguratorModal } =
    usePromptConfiguratorModal({
      spaceId,
      source: 'app_detail_page',
      projectId,
      workflowId,
    });

  const handleOnFocus = () => {
    setIsFocused(true);
  };

  const handleOnBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={s.container} onBlur={() => onChange?.(promptValue.current)}>
      <FormCard
        defaultExpand
        showBottomBorder
        noPadding
        header={I18n.t('workflow_LLM_node_sp_title')}
        tooltip={I18n.t('workflow_detail_llm_sys_prompt_content_tips')}
        contentClassName={classNames(s['code-content'], {
          [s['code-content-focus']]: isFocused,
        })}
        actionButton={
          <PromptKitBar
            {...props}
            getConversationId={getConversationId}
            getPromptContextInfo={getPromptContextInfo}
            onInsertPrompt={prompt => props?.onChange(prompt)}
            openPromptLibrary={open}
            openCreatePrompt={openCreatePrompt}
            onAddLibrary={onAddLibrary}
          />
        }
      >
        <SystemPromptEditor
          defaultValue={value}
          value={value}
          onChange={v => (promptValue.current = v)}
          readonly={readonly}
          placeholder={placeholder as React.ReactNode}
          isControled
          dataTestID={dataTestID}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
        />
        <InputSlotWidget mode="input" />
        <LibraryBlockWidget
          {
            // Support soon, so stay tuned.
            ...(isHitLLMPromptSkills
              ? {
                  librarys: libraries,
                  disabledTooltips: readonly,
                }
              : {
                  librarys: [],
                  readonly: true,
                })
          }
          spaceId={spaceId}
          projectId={type === 'project' ? id : undefined}
          onAddLibrary={(library, pos) => {
            focusToAnchor(editor, pos);
            onAddLibrary?.(library);
          }}
          onRename={pos => focusToAnchor(editor, pos)}
        />
        <HighlightExpressionOnActive />

        {/* Support soon, so stay tuned. */}
        {isHitLLMPromptSkills ? (
          <ContentSearchPopover
            variableTree={variableTree}
            libraries={libraries}
            readonly={readonly}
            onInsert={pos => focusToAnchor(editor, pos)}
          />
        ) : (
          <Completion variableTree={variableTree} />
        )}

        <Validation variableTree={variableTree} />
      </FormCard>
      <NLPromptModal
        getConversationId={getConversationId}
        getPromptContextInfo={getPromptContextInfo}
      />
      {PromptLibrary}
      {promptConfiguratorModal}
    </div>
  );
};
