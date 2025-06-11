/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './namespaces/base';
import * as common from './namespaces/common';
import * as entity from './namespaces/entity';

export { base, common, entity };
export * from './namespaces/base';
export * from './namespaces/common';
export * from './namespaces/entity';

export type Int64 = string | number;

export default class MagicEnglishService<T> {
  private request: any = () => {
    throw new Error('MagicEnglishService.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || '';
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string'
      ? this.baseURL + path
      : this.baseURL(path);
  }

  /** GET /api/magic/tts_token */
  GetTTSToken(
    req?: entity.GetTTSTokenReq,
    options?: T,
  ): Promise<entity.GetTTSTokenResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/tts_token');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /api/magic/chat_llm */
  ChatWithLLM(
    req?: entity.ChatWithLLMReq,
    options?: T,
  ): Promise<entity.ChatWithLLMResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/chat_llm');
    const method = 'POST';
    const data = {
      text: _req['text'],
      duration: _req['duration'],
      audio_id: _req['audio_id'],
      conversation_id: _req['conversation_id'],
      message_id: _req['message_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** POST /api/magic/start_chat */
  StartChat(
    req: entity.StartChatReq,
    options?: T,
  ): Promise<entity.StartChatResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/start_chat');
    const method = 'POST';
    const data = {
      exercise_id: _req['exercise_id'],
      conversation_id: _req['conversation_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/magic/get_learning_path */
  GetLearningPath(
    req?: entity.GetLearningPathReq,
    options?: T,
  ): Promise<entity.GetLearningPathResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/get_learning_path');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /api/magic/unlock_topic */
  UnlockTopic(
    req: entity.UnlockTopicReq,
    options?: T,
  ): Promise<entity.UnlockTopicResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/unlock_topic');
    const method = 'POST';
    const data = { topic_id: _req['topic_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/magic/get_exercise_info */
  GetExerciseInfo(
    req: entity.GetExerciseInfoReq,
    options?: T,
  ): Promise<entity.GetExerciseInfoResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/get_exercise_info');
    const method = 'GET';
    const params = { exercise_id: _req['exercise_id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/magic/get_message_tip
   *
   * 消息提示
   */
  GetMessageTip(
    req?: entity.GetMessageTipReq,
    options?: T,
  ): Promise<entity.GetMessageTipResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/get_message_tip');
    const method = 'GET';
    const params = { message_id: _req['message_id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/magic/message_eval
   *
   * 用户消息评测
   */
  MessageEval(
    req?: entity.MessageEvalReq,
    options?: T,
  ): Promise<entity.MessageEvalResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/message_eval');
    const method = 'POST';
    const data = { message_id: _req['message_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/magic/list_phase */
  ListPhase(
    req?: entity.ListPhaseReq,
    options?: T,
  ): Promise<entity.ListPhaseResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/list_phase');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /** POST /api/magic/select_phase */
  SelectPhase(
    req: entity.SelectPhaseReq,
    options?: T,
  ): Promise<entity.SelectPhaseResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/select_phase');
    const method = 'POST';
    const data = { phase_id: _req['phase_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /** GET /api/magic/get_user_level */
  GetUserLevel(
    req?: entity.GetUserLevelReq,
    options?: T,
  ): Promise<entity.GetUserLevelResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/get_user_level');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/magic/translate_message
   *
   * 消息翻译
   */
  TranslateMessage(
    req: entity.TranslateMessageReq,
    options?: T,
  ): Promise<entity.TranslateMessageResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/translate_message');
    const method = 'POST';
    const data = { message_id: _req['message_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/magic/resume_conversation
   *
   * 恢复对话
   */
  ResumeConversation(
    req: entity.ResumeConversationReq,
    options?: T,
  ): Promise<entity.ResumeConversationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/resume_conversation');
    const method = 'POST';
    const data = {
      conversation_id: _req['conversation_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/magic/close_conversation
   *
   * 结束对话
   */
  CloseConversation(
    req: entity.CloseConversationReq,
    options?: T,
  ): Promise<entity.CloseConversationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/close_conversation');
    const method = 'POST';
    const data = {
      conversation_id: _req['conversation_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/magic/get_last_conversation
   *
   * 获取节点上次对话
   */
  GetLastConversation(
    req: entity.GetLastConversationReq,
    options?: T,
  ): Promise<entity.GetLastConversationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/get_last_conversation');
    const method = 'GET';
    const params = { exercise_id: _req['exercise_id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/magic/conversation/record
   *
   * 获取对话练习记录
   */
  ListConversationRecord(
    req?: entity.ListConversationRecordReq,
    options?: T,
  ): Promise<entity.ListConversationRecordResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/conversation/record');
    const method = 'GET';
    const params = {
      exercise_id: _req['exercise_id'],
      status: _req['status'],
      page: _req['page'],
      page_size: _req['page_size'],
      base: _req['base'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/magic/conversation/detail
   *
   * 获取对话详情
   */
  GetConversationDetail(
    req: entity.GetConversationDetailReq,
    options?: T,
  ): Promise<entity.GetConversationDetailResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/conversation/detail');
    const method = 'GET';
    const params = { id: _req['id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/magic/report
   *
   * 生成对话报告
   */
  CreateConversationReport(
    req: entity.CreateConversationReportReq,
    options?: T,
  ): Promise<entity.CreateConversationReportResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/report');
    const method = 'POST';
    const data = {
      conversation_id: _req['conversation_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/magic/get_js_sdk_config
   *
   * 获取JSSDK配置
   */
  GetJSSDKConfig(
    req: entity.GetJSSDKConfigReq,
    options?: T,
  ): Promise<entity.GetJSSDKConfigResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/get_js_sdk_config');
    const method = 'GET';
    const params = { url: _req['url'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/magic/calendar/duration
   *
   * 更新使用时长
   */
  UpdateStudyDuration(
    req: entity.UpdateStudyDurationReq,
    options?: T,
  ): Promise<entity.UpdateStudyDurationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/magic/calendar/duration');
    const method = 'POST';
    const data = { duration: _req['duration'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/magic/calendar/duration/today
   *
   * 获取今日使用时长
   */
  GetTodayDuration(
    req?: entity.GetTodayDurationReq,
    options?: T,
  ): Promise<entity.GetTodayDurationResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/calendar/duration/today');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/magic/calendar/duration/total
   *
   * 获取累计使用时长
   */
  GetTotalDuration(
    req?: entity.GetTotalDurationReq,
    options?: T,
  ): Promise<entity.GetTotalDurationResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/magic/calendar/duration/total');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }
}
/* eslint-enable */
