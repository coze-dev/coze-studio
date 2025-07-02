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
