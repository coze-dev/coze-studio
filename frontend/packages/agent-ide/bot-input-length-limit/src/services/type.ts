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
  /** Agent 名称的长度 */
  botName: number;
  /** Agent 描述的长度 */
  botDescription: number;
  /** Agent 开场白的长度 */
  onboarding: number;
  /** Agent 单条开场白建议的长度 */
  onboardingSuggestion: number;
  /** 用户问题建议自定义 prompt 长度 */
  suggestionPrompt: number;
  /** Project 名称的长度 */
  projectName: number;
  /** Project 描述的长度 */
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
