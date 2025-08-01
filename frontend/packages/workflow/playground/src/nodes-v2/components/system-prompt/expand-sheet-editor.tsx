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

import { type FC, useMemo } from 'react';

import { useGlobalVariableServiceState } from '@coze-workflow/variable';
import {
  NLPromptButton,
  NLPromptModal,
  NlPromptAction,
  NlPromptShortcut,
} from '@coze-workflow/resources-adapter';
import { type ExpressionEditorTreeNode } from '@coze-workflow/components';
import { useNodeTestId } from '@coze-workflow/base';
import { type EditorAPI, useEditor } from '@coze-common/prompt-kit-base/editor';
import { usePromptConfiguratorModal } from '@coze-common/prompt-kit-adapter/create-prompt';
import { RecommendPannel } from '@coze-common/prompt-kit/prompt-recommend';
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
import { InsertInputSlotAction } from '@coze-common/editor-plugins/actions';
import { ActionBar } from '@coze-common/editor-plugins/action-bar';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozCrossFill,
  IconCozLightbulb,
  IconCozTrayArrowUp,
} from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton, Button } from '@coze-arch/coze-design';

import { focusToAnchor } from '@/nodes-v2/components/system-prompt/utils';
import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useGlobalState } from '@/hooks';
import { useLLMPromptHistory } from '@/form-extensions/hooks';
import { useTestRunResult } from '@/components/test-run/img-log/use-test-run-result';
import { ExpandEditorContainer } from '@/components/editor-container';

import { useVariableTree } from '../expression-editor/hooks';
import { type ExpressionEditorProps } from '../expression-editor';
import { useLibrariesStore } from './use-libraries-store';
import { SystemPromptEditor } from './system-prompt-editor';

import styles from './index.module.less';
interface ExpandSheetEditorProps
  extends ExpressionEditorProps,
    ContentSearchPopoverProps {
  readonly?: boolean;
  onAddLibrary?: (library: ILibraryItem) => void;
}

export const ExpandSheetEditor: FC<ExpandSheetEditorProps> = props => {
  const { readonly } = props;
  const { getNodeSetterId } = useNodeTestId();
  const dataTestID = getNodeSetterId(props.name);
  const editor = useEditor<EditorAPI>();
  const { id, type } = useGlobalVariableServiceState();

  const { libraries } = useLibrariesStore(state => ({
    libraries: state.libraries,
  }));

  const variableTree: ExpressionEditorTreeNode[] = useVariableTree();

  const { setFullscreenPanel } = useNodeFormPanelState();

  const {
    spaceId,
    projectId,
    workflowId,
    info: { name = '', desc = '' },
  } = useGlobalState();
  const isHitLLMPromptSkills = true;

  const testRunResult = useTestRunResult();
  const contextHistory = useLLMPromptHistory(props?.value, testRunResult);

  const getConversationId = () => '';
  const getPromptContextInfo = useMemo(
    () => () => ({
      // No need to pass bot_id workflow scenario
      botId: '',
      name,
      description: desc,
      contextHistory,
    }),
    [name, desc, contextHistory],
  );
  const prompt = editor?.getValue();

  const { open, node: PromptLibrary } = usePromptLibraryModal({
    spaceId,
    getConversationId,
    getPromptContextInfo,
    source: 'app_detail_page',
    projectId,
    workflowId,
    editor,
    onInsertPrompt: (insertPrompt, info) => props?.onChange(insertPrompt),
  });

  const { open: openCreatePrompt, node: promptConfiguratorModal } =
    usePromptConfiguratorModal({
      spaceId,
      projectId,
      workflowId,
      source: 'app_detail_page',
    });

  return (
    <>
      <ExpandEditorContainer
        id={'system-prompt-expand-editor'}
        closeButton={
          <div className="flex items-center gap-[8px]">
            <Tooltip content={I18n.t('compare_tooltips_submit_to_the_prompt')}>
              <Button
                color="secondary"
                icon={<IconCozTrayArrowUp />}
                onClick={() =>
                  openCreatePrompt({
                    mode: 'create',
                    defaultPrompt: editor?.getValue(),
                  })
                }
              ></Button>
            </Tooltip>

            {/* will support soon */}
            {IS_OPEN_SOURCE ? null : (
              <NLPromptButton disabled={props?.readonly} onlyIcon />
            )}

            <Tooltip content={I18n.t('workflow_prompt_editor_view_library')}>
              <IconButton
                onClick={() => {
                  open();
                }}
                icon={<IconCozLightbulb />}
                color="secondary"
                disabled={readonly}
              />
            </Tooltip>
            <IconButton
              onClick={() => setFullscreenPanel(null)}
              color="secondary"
              icon={<IconCozCrossFill color="#060709CC" />}
            />
          </div>
        }
        containerClassName="bg-[#FCFCFF]"
        headerClassName="bg-[#FCFCFF] text-[16px] leading-[22px] font-medium mb-[12px] !p-[20px]"
        editorTitle={
          <div className="flex items-center gap-[8px]">
            <div
              className="text-[16px] leading-[22px] font-medium"
              style={{
                color: 'var(--Fg-COZ-fg-plus, rgba(6, 7, 9, 0.96))',
              }}
            >
              {I18n.t('workflow_LLM_node_sp_title')}
            </div>
          </div>
        }
        contentClassName={styles['editor-content']}
        editorContent={
          <>
            <div className="relative w-full h-full pl-[8px] pr-[20px]">
              <SystemPromptEditor
                defaultValue={props?.value}
                onChange={props?.onChange}
                readonly={props?.readonly}
                placeholder={props?.placeholder as React.ReactNode}
                wrapperClassName={styles['prompt-editor']}
                wrapperStyle={{
                  height: '100%',
                }}
                dataTestID={dataTestID}
              />

              <InputSlotWidget mode="input" />
              <LibraryBlockWidget
                {...(isHitLLMPromptSkills
                  ? {
                      librarys: libraries,
                      disabledTooltips: props.readonly,
                    }
                  : {
                      librarys: [],
                      readonly: true,
                    })}
                spaceId={spaceId}
                projectId={type === 'project' ? id : undefined}
                onAddLibrary={props.onAddLibrary}
                onRename={pos => focusToAnchor(editor, pos)}
              />
              <NlPromptShortcut shortcutKey="/" />

              <HighlightExpressionOnActive />
              {isHitLLMPromptSkills ? (
                <ContentSearchPopover
                  variableTree={variableTree}
                  libraries={libraries}
                  readonly={props.readonly}
                  onInsert={pos => focusToAnchor(editor, pos)}
                />
              ) : (
                <Completion variableTree={variableTree} />
              )}

              <Validation variableTree={variableTree} />

              {!props?.readonly && (
                <>
                  <ActionBar>
                    <NlPromptAction />
                    <InsertInputSlotAction />
                  </ActionBar>
                  {prompt?.length === 0 ? (
                    <RecommendPannel
                      tabs={['Recommended', 'Team']}
                      importPromptWhenEmpty={props?.value}
                      source="app_detail_page"
                      projectId={projectId}
                      workflowId={workflowId}
                      spaceId={spaceId}
                      getConversationId={getConversationId}
                      getPromptContextInfo={getPromptContextInfo}
                      onInsertPrompt={(insertPrompt, info) => {
                        props?.onChange(insertPrompt);
                      }}
                      listContainerClassName="h-[211px]"
                      cardClassName="w-[240xp]"
                    />
                  ) : null}
                </>
              )}
            </div>
            <NLPromptModal
              getConversationId={getConversationId}
              getPromptContextInfo={getPromptContextInfo}
            />
            {PromptLibrary}
            {promptConfiguratorModal}
          </>
        }
      />
    </>
  );
};
