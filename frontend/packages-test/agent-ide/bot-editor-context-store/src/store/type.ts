import { type ExtendOnboardingContent } from '@coze-studio/bot-detail-store';
export type BotEditorOnboardingSuggestion =
  ExtendOnboardingContent['suggested_questions'][number];

export interface ModelPresetValues {
  defaultValues: Record<string, unknown>;
  creative?: Record<string, unknown>;
  balance?: Record<string, unknown>;
  precise?: Record<string, unknown>;
}
export interface NLPromptModalPosition {
  top: number;
  left: number;
}
