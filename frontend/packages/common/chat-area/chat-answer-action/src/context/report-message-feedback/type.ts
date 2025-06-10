import { type ChatCore } from '@coze-common/chat-core';
export type ReportMessageFeedbackFn = ChatCore['reportMessage'];

export interface ReportMessageFeedbackFnProviderProps {
  reportMessageFeedback: ReportMessageFeedbackFn;
}
