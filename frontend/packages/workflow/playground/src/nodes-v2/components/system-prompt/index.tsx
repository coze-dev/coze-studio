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
      // workflow 场景下 bot_id 不用传
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
