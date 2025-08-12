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

import { useMemo, type FC } from 'react';

import type {
  ILibraryItem,
  ILibraryList,
} from '@coze-common/editor-plugins/library-insert';
import { NLPromptProvider } from '@coze-workflow/resources-adapter';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useGlobalState } from '@/hooks';
import { useLLMPromptHistory } from '@/form-extensions/hooks';
import { useTestRunResult } from '@/components/test-run/img-log/use-test-run-result';

import type { ExpressionEditorProps } from '../expression-editor';
import { EditorWithPromptKit } from './prompt-editor-with-kit';

export interface SystemPromptProps extends ExpressionEditorProps {
  libraries: ILibraryList;
  onAddLibrary?: (library: ILibraryItem) => void;
}

export const SystemPrompt: FC<SystemPromptProps> = props => {
  const readonly = useReadonly();

  const { fullscreenPanel } = useNodeFormPanelState();

  const {
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
    [name, desc, contextHistory],
  );

  return (
    <PromptEditorProvider>
      <NLPromptProvider>
        <EditorWithPromptKit
          {...props}
          readonly={(readonly || !!fullscreenPanel) as boolean}
          getConversationId={getConversationId}
          getPromptContextInfo={getPromptContextInfo}
        />
      </NLPromptProvider>
    </PromptEditorProvider>
  );
};
