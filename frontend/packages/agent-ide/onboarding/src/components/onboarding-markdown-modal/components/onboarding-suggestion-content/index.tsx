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
