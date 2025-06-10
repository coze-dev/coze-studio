import { useMemo, type FC } from 'react';

import { NLPromptProvider } from '@coze-workflow/resources-adapter';
import { PromptEditorProvider } from '@coze-common/prompt-kit-base/editor';

import { useNodeFormPanelState } from '@/hooks/use-node-side-sheet-store';
import { useGlobalState } from '@/hooks';
import { useLLMPromptHistory } from '@/form-extensions/hooks';
import { useTestRunResult } from '@/components/test-run/img-log/use-test-run-result';

import { type ExpressionEditorProps } from '../expression-editor';
import { EditorWithPromptKit } from './prompt-editor-with-kit';

export const SystemPrompt: FC<ExpressionEditorProps> = props => {
  const { readonly, value } = props;
  const { fullscreenPanel } = useNodeFormPanelState();
  const fullscreenPanelVisible = !!fullscreenPanel;

  const {
    info: { name = '', desc = '' },
  } = useGlobalState();

  const testRunResult = useTestRunResult();
  const contextHistory = useLLMPromptHistory(value, testRunResult);

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
          readonly={(readonly || fullscreenPanelVisible) as boolean}
          getConversationId={getConversationId}
          getPromptContextInfo={getPromptContextInfo}
        />
      </NLPromptProvider>
    </PromptEditorProvider>
  );
};

export const systemPrompt = {
  key: 'SystemPrompt',
  component: SystemPrompt,
};
