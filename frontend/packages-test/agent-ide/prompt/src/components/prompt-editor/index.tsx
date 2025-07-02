import { lazy, Suspense } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { usePersonaStore } from '@coze-studio/bot-detail-store/persona';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { Spin } from '@coze-arch/coze-design';
const AgentIdePrompt = lazy(() => import('./agent-ide-prompt'));

export interface PromptEditorEntryProps {
  className?: string;
  isSingle: boolean;
  editorExtensions?: React.ReactNode;
}

export const PromptEditorEntry: React.FC<PromptEditorEntryProps> = ({
  className,
  isSingle,
  editorExtensions,
}) => {
  const { systemMessageData, setPersonaByImmer } = usePersonaStore(
    useShallow(state => ({
      systemMessageData: state.systemMessage.data,
      setPersonaByImmer: state.setPersonaByImmer,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const onChange = (value: string) => {
    setPersonaByImmer(persona => {
      persona.systemMessage.data = value;
    });
  };

  return (
    <Suspense fallback={<Spin style={{ width: '100%', height: '100%' }} />}>
      <AgentIdePrompt
        className={className}
        defaultValue={systemMessageData}
        onChange={onChange}
        readonly={isReadonly}
        isSingle={isSingle}
        editorExtensions={editorExtensions}
      />
    </Suspense>
  );
};
