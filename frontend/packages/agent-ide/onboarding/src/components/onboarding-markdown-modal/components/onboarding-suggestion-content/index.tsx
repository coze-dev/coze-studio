import { type SuggestQuestionMessage } from '@coze-studio/bot-detail-store';
import { type BotEditorOnboardingSuggestion } from '@coze-agent-ide/bot-editor-context-store';

import { OnboardingSuggestion } from '../../../onboarding-suggestion';

export interface OnboardingSuggestionContentProps {
  onSuggestionChange: (param: SuggestQuestionMessage) => void;
  onDeleteSuggestion: (id: string) => void;
  onboardingSuggestions: BotEditorOnboardingSuggestion[];
}
export const OnboardingSuggestionContent: React.FC<
  OnboardingSuggestionContentProps
> = ({ onDeleteSuggestion, onSuggestionChange, onboardingSuggestions }) => (
  <>
    {onboardingSuggestions.map(({ id, content, highlight }) => (
      <OnboardingSuggestion
        key={id}
        id={id}
        value={content}
        onChange={(changedId, value) => {
          onSuggestionChange({ id: changedId, content: value, highlight });
        }}
        onDelete={onDeleteSuggestion}
      />
    ))}
  </>
);
