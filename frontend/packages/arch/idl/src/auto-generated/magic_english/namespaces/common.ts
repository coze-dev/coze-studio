/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ConversationStatus {
  /** 对话中 */
  InProgress = 0,
  /** 已完成 */
  Finished = 1,
}

export enum ExerciseType {
  NORMAL = 1,
  TEST = 2,
}

/** ======================= 枚举 ======================= */
export enum MessageRole {
  /** 模型 */
  Assistant = 1,
  /** 用户 */
  User = 2,
}

export enum NodeStatus {
  Locked = 0,
  InProgress = 1,
  Finished = 2,
}

export enum PhraseStatus {
  UNUSED = 0,
  USED = 1,
}

export enum ReportStatus {
  /** 无效 */
  Expired = 0,
  /** 有效 */
  Normal = 1,
}

export enum TaskStatus {
  UNFINISHED = 0,
  FINISHED = 1,
}

export enum TopicType {
  BIZ = 1,
  INTEREST = 2,
  REALTIME = 3,
}

export enum UserExerciseStatus {
  /** 练习中 */
  InProgress = 0,
  /** 已完成 */
  Finished = 1,
}

export interface Conversation {
  id: Int64;
  user_id?: Int64;
  exercise_id?: Int64;
  status?: ConversationStatus;
  report?: ConversationReport;
  /** 用户对话轮数 */
  user_message_count?: number;
  message_list?: Array<ConversationMessage>;
  task_list?: Array<ExerciseTask>;
  phrase_list?: Array<Phrase>;
  /** 更新时间 */
  updated_at?: Int64;
  /** 创建时间 */
  created_at?: Int64;
}

export interface ConversationMessage {
  id?: Int64;
  role?: MessageRole;
  content?: string;
  audio_id?: string;
  duration?: number;
  has_eval?: boolean;
  accuracy_score?: number;
  fluency_score?: number;
  answer_recombined?: string;
  revised_answer?: string;
  revise_reason?: string;
  optimized_answer?: string;
  translation?: string;
  optimized_translation?: string;
  /** 更新时间 */
  updated_at?: Int64;
  /** 创建时间 */
  created_at?: Int64;
}

export interface ConversationReport {
  id?: Int64;
  conversation_id?: Int64;
  total_score?: number;
  accuracy_score?: number;
  fluency_score?: number;
  task_score?: number;
  phrase_score?: number;
  detail_score?: number;
  summary?: string;
  status?: ReportStatus;
  created_at?: Int64;
  updated_at?: Int64;
}

export interface Exercise {
  exercise_id: Int64;
  exercise_title?: string;
  exercise_description?: string;
  exercise_type?: ExerciseType;
  status?: NodeStatus;
  topic_id?: Int64;
}

export interface ExerciseTask {
  task_id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface JSSDKConfig {
  app_id?: string;
  nonce_str?: string;
  signature?: string;
  timestamp?: string;
}

export interface MessageEvalData {
  message_id?: string;
  used_phrase_list?: Array<Phrase>;
  finished_task_list?: Array<ExerciseTask>;
  accuracy_score?: number;
  fluency_score?: number;
  answer_recombined?: string;
  revised_answer?: string;
  revise_reason?: string;
  optimized_answer?: string;
  optimized_translation?: string;
}

/** ======================= 模型 ======================= */
export interface Phase {
  phase_id: Int64;
  phase_title?: string;
  phase_description?: string;
  phase_detail?: string;
  section_list?: Array<Section>;
  status?: NodeStatus;
  disabled?: boolean;
}

export interface Phrase {
  phrase_id: string;
  zh_text?: string;
  en_text?: string;
  usage_list?: Array<PhraseUsage>;
  example_list?: Array<PhraseExample>;
  status?: PhraseStatus;
}

export interface PhraseExample {
  zh_text?: string;
  en_text?: string;
  video_url?: string;
}

export interface PhraseUsage {
  zh_text?: string;
  en_text?: string;
}

export interface Section {
  section_id: Int64;
  section_title?: string;
  section_description?: string;
  topic_list?: Array<Topic>;
  status?: NodeStatus;
  phase_id?: Int64;
}

export interface Topic {
  topic_id: Int64;
  topic_title?: string;
  topic_description?: string;
  topic_type?: TopicType;
  exercise_list?: Array<Exercise>;
  status?: NodeStatus;
  section_id?: Int64;
}

export interface UserLevelData {
  level?: string;
  is_new_user?: boolean;
  phase_list?: Array<Phase>;
  recommend_phase?: Phase;
}

export interface VoiceToken {
  token: string;
}
/* eslint-enable */
