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

import { type SuggestedQuestionsShowMode } from '@coze-arch/bot-api/playground_api';

export interface BotInputLengthConfig {
  /** Length of Agent Name */
  botName: number;
  /** Length of Agent Description */
  botDescription: number;
  /** Length of Agent's opening statement */
  onboarding: number;
  /** Agent, the length of a single opening line suggestion */
  onboardingSuggestion: number;
  /** User question Suggested custom prompt length */
  suggestionPrompt: number;
  /** Length of Project Name */
  projectName: number;
  /** Project Description Length */
  projectDescription: number;
}

export interface SuggestQuestionMessage {
  id: string;
  content: string;
  highlight?: boolean;
}
export interface WorkInfoOnboardingContent {
  prologue: string;
  suggested_questions: SuggestQuestionMessage[];
  suggested_questions_show_mode: SuggestedQuestionsShowMode;
}
