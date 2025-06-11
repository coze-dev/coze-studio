/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export interface ChatWithLLMReq {
  /** 文本内容 */
  text?: string;
  /** 时长 */
  duration?: number;
  /** 音频 ID */
  audio_id?: string;
  /** 对话 ID */
  conversation_id?: string;
  /** 消息 ID, 若为空则创建新消息 */
  message_id?: Int64;
  base?: base.Base;
}

export interface ChatWithLLMResp {
  content?: string;
  is_finished?: boolean;
  message_id?: string;
  role?: common.MessageRole;
  conversation_id?: string;
  base_resp?: base.BaseResp;
}

export interface CloseConversationReq {
  conversation_id: string;
  base?: base.Base;
}

export interface CloseConversationResp {
  conversation?: common.Conversation;
  base_resp?: base.BaseResp;
}

export interface CreateConversationReportReq {
  conversation_id: string;
  base?: base.Base;
}

export interface CreateConversationReportResp {
  report?: common.ConversationReport;
  base_resp?: base.BaseResp;
}

export interface GetConversationDetailReq {
  id: Int64;
  base?: base.Base;
}

export interface GetConversationDetailResp {
  conversation?: common.Conversation;
  base_resp?: base.BaseResp;
}

export interface GetExerciseInfoReq {
  exercise_id: string;
  base?: base.Base;
}

export interface GetExerciseInfoResp {
  exercise_info?: common.Exercise;
  phrase_list?: Array<common.Phrase>;
  task_list?: Array<common.ExerciseTask>;
  base_resp?: base.BaseResp;
}

export interface GetJSSDKConfigReq {
  url: string;
  base?: base.Base;
}

export interface GetJSSDKConfigResp {
  config?: common.JSSDKConfig;
  base_resp?: base.BaseResp;
}

export interface GetLastConversationReq {
  exercise_id: Int64;
  base?: base.Base;
}

export interface GetLastConversationResp {
  conversation?: common.Conversation;
  base_resp?: base.BaseResp;
}

export interface GetLearningPathReq {
  base?: base.Base;
}

export interface GetLearningPathResp {
  phase_list?: Array<common.Phase>;
  is_new_user?: boolean;
  base_resp?: base.BaseResp;
}

export interface GetMessageTipReq {
  message_id?: string;
  base?: base.Base;
}

export interface GetMessageTipResp {
  tip?: string;
  base_resp?: base.BaseResp;
}

export interface GetTodayDurationReq {
  base?: base.Base;
}

export interface GetTodayDurationResp {
  duration?: number;
  base_resp?: base.BaseResp;
}

export interface GetTotalDurationReq {
  base?: base.Base;
}

export interface GetTotalDurationResp {
  duration?: number;
  base_resp?: base.BaseResp;
}

export interface GetTTSTokenReq {
  base?: base.Base;
}

export interface GetTTSTokenResp {
  data: common.VoiceToken;
  base_resp?: base.BaseResp;
}

export interface GetUserLevelReq {
  base?: base.Base;
}

export interface GetUserLevelResp {
  data?: common.UserLevelData;
  base_resp?: base.BaseResp;
}

export interface ListConversationRecordReq {
  exercise_id?: Int64;
  status?: common.ConversationStatus;
  page?: number;
  page_size?: number;
  base?: base.Base;
}

export interface ListConversationRecordResp {
  conversations?: Array<common.Conversation>;
  total?: number;
  page?: number;
  page_size?: number;
  base_resp?: base.BaseResp;
}

export interface ListPhaseReq {
  base?: base.Base;
}

export interface ListPhaseResp {
  phase_list?: Array<common.Phase>;
  base_resp?: base.BaseResp;
}

export interface MessageEvalReq {
  message_id?: string;
  base?: base.Base;
}

export interface MessageEvalResp {
  data?: common.MessageEvalData;
  base_resp?: base.BaseResp;
}

export interface ResumeConversationReq {
  conversation_id: string;
  base?: base.Base;
}

export interface ResumeConversationResp {
  conversation?: common.Conversation;
  base_resp?: base.BaseResp;
}

export interface SelectPhaseReq {
  /** 阶段 id */
  phase_id: string;
  base?: base.Base;
}

export interface SelectPhaseResp {
  selected_phase?: common.Phase;
  base_resp?: base.BaseResp;
}

export interface StartChatReq {
  /** 练习 id */
  exercise_id: string;
  /** conversation id */
  conversation_id?: Int64;
  base?: base.Base;
}

export interface StartChatResp {
  content?: string;
  is_finished?: boolean;
  message_id?: string;
  role?: common.MessageRole;
  conversation_id?: string;
  base_resp?: base.BaseResp;
}

export interface TranslateMessageReq {
  message_id: string;
  base?: base.Base;
}

export interface TranslateMessageResp {
  translation?: string;
  base_resp?: base.BaseResp;
}

export interface UnlockTopicReq {
  topic_id: string;
  base?: base.Base;
}

export interface UnlockTopicResp {
  unlocked_topic?: common.Topic;
  base_resp?: base.BaseResp;
}

export interface UpdateStudyDurationReq {
  duration: number;
  base?: base.Base;
}

export interface UpdateStudyDurationResp {
  success?: boolean;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
