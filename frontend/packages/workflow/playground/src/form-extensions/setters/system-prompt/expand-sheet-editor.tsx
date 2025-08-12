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

import { type ExpressionEditorTreeNode } from '@coze-workflow/components';
import { LibraryBlockWidget } from '@coze-common/editor-plugins/library-insert';
import { InputSlotWidget } from '@coze-common/editor-plugins/input-slot';
import {
  Completion,
  Validation,
  HighlightExpressionOnActive,
} from '@coze-common/editor-plugins/expression';
import { InsertInputSlotAction } from '@coze-common/editor-plugins/actions';
import { ActionBar } from '@coze-common/editor-plugins/action-bar';
import {
  NLPromptButton,
  NLPromptModal,
  NlPromptAction,
  NlPromptShortcut,
} from '@coze-workflow/resources-adapter';
import { useNodeTestId } from '@coze-workflow/base';
import { type EditorAPI, useEditor } from '@coze-common/prompt-kit-base/editor';
import { RecommendPannel } from '@coze-common/prompt-kit/prompt-recommend';
import { I18n } from '@coze-arch/i18n';
import { UIIconButton } from '@coze-arch/bot-semi';
import { IconCozCrossFill } from '@coze-arch/coze-design/icons';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useGlobalState } from '@/hooks';
import { type ExpressionEditorProps } from '@/form-extensions/setters/expression-editor';
import { useLLMPromptHistory } from '@/form-extensions/hooks';
import { useTestRunResult } from '@/components/test-run/img-log/use-test-run-result';

import { useVariableTree } from '../expression-editor/hooks';
import { SystemPromptEditor } from './system-prompt-editor';

import styles from './index.module.less';
export const ExpandSheetEditor: FC<ExpressionEditorProps> = props => {
  const { getNodeSetterId } = useNodeTestId();
  const dataTestID = getNodeSetterId(props.context.path);

  const variableTree: ExpressionEditorTreeNode[] = useVariableTree();
  const editor = useEditor<EditorAPI>();
  const prompt = editor?.getValue();

  const { setFullscreenPanel } = useNodeFormPanelState();

  const {
    spaceId,
    info: { name = '', desc = '' },
  } = useGlobalState();

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
    [contextHistory, name, desc],
  );
  return (
    <div className="relative w-full h-full bg-[#FCFCFF] py-[12px] rounded-[8px]">
      <div className="w-full flex justify-between mb-[12px] px-[20px]">
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
        <div className="flex items-center gap-[8px]">
          <NLPromptButton disabled={props?.readonly}>
            {I18n.t('prompt_optimization_button')}
          </NLPromptButton>
          <UIIconButton
            onClick={() => setFullscreenPanel(null)}
            icon={<IconCozCrossFill color="#060709CC" />}
          />
        </div>
      </div>
      <div
        className="w-full pl-[8px] pr-[20px]"
        style={{ height: 'calc(100% - 25px)' }}
      >
        <SystemPromptEditor
          defaultValue={props?.value}
          onChange={props?.onChange}
          readonly={props?.readonly}
          placeholder={(props?.options?.placeholder as () => string)?.()}
          wrapperClassName={styles['prompt-editor']}
          wrapperStyle={{
            height: '100%',
          }}
          dataTestID={dataTestID}
        />

        <InputSlotWidget mode="input" />
        <LibraryBlockWidget librarys={[]} readonly spaceId={spaceId} />
        <NlPromptShortcut shortcutKey="/" />

        <HighlightExpressionOnActive />
        <Completion variableTree={variableTree} />
        <Validation variableTree={variableTree} />

        {!props?.readonly && (
          <>
            <ActionBar>
              <NlPromptAction />
              <InsertInputSlotAction />
            </ActionBar>
            {prompt?.length === 0 ? (
              <RecommendPannel
                source="app_detail_page"
                tabs={['Recommended', 'Team']}
                importPromptWhenEmpty={props?.value}
                spaceId={spaceId}
                getConversationId={getConversationId}
                getPromptContextInfo={getPromptContextInfo}
                onInsertPrompt={insertPrompt => {
                  props?.onChange?.(insertPrompt);
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
    </div>
  );
};
