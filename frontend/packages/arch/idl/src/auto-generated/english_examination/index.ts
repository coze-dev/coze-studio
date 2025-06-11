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

export default class EnglishExaminationService<T> {
  private request: any = () => {
    throw new Error('EnglishExaminationService.request is undefined');
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

  /**
   * GET /api/examination/login
   *
   * 用户登录
   */
  Login(req?: entity.LoginReq, options?: T): Promise<entity.LoginResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/login');
    const method = 'GET';
    const params = {
      code: _req['code'],
      state: _req['state'],
      session_id: _req['session_id'],
      base: _req['base'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/examination/paper
   *
   * 创建试卷
   */
  CreatePaper(
    req: entity.CreatePaperReq,
    options?: T,
  ): Promise<entity.CreatePaperResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/paper');
    const method = 'POST';
    const data = {
      name: _req['name'],
      level: _req['level'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * PUT /api/examination/paper
   *
   * 更新试卷
   */
  UpdatePaper(
    req?: entity.UpdatePaperReq,
    options?: T,
  ): Promise<entity.UpdatePaperResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/paper');
    const method = 'PUT';
    const data = {
      id: _req['id'],
      name: _req['name'],
      level: _req['level'],
      status: _req['status'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/user_info
   *
   * 获取用户信息
   */
  GetSessionUserInfo(
    req?: entity.GetSessionUserInfoReq,
    options?: T,
  ): Promise<entity.GetSessionUserInfoResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/user_info');
    const method = 'GET';
    const params = { base: _req['base'] };
    const headers = { 'x-innovation-token': _req['x-innovation-token'] };
    return this.request({ url, method, params, headers }, options);
  }

  /**
   * GET /api/examination/paper
   *
   * 获取试卷列表
   */
  ListPaper(
    req?: entity.ListPaperReq,
    options?: T,
  ): Promise<entity.ListPaperResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/paper');
    const method = 'GET';
    const params = {
      page: _req['page'],
      page_size: _req['page_size'],
      status: _req['status'],
      level: _req['level'],
      base: _req['base'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * DELETE /api/examination/paper/:id
   *
   * 删除试卷
   */
  DeletePaper(
    req: entity.DeletePaperReq,
    options?: T,
  ): Promise<entity.DeletePaperResp> {
    const _req = req;
    const url = this.genBaseURL(`/api/examination/paper/${_req['id']}`);
    const method = 'DELETE';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/examination/loginByJwt
   *
   * JWT登录
   */
  LoginByJwt(
    req: entity.LoginByJwtReq,
    options?: T,
  ): Promise<entity.LoginByJwtResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/loginByJwt');
    const method = 'GET';
    const params = { base: _req['base'] };
    const headers = { authorization: _req['authorization'] };
    return this.request({ url, method, params, headers }, options);
  }

  /**
   * POST /api/examination/question_group
   *
   * 创建题目组
   */
  CreateQuestionGroup(
    req: entity.CreateQuestionGroupReq,
    options?: T,
  ): Promise<entity.CreateQuestionGroupResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/question_group');
    const method = 'POST';
    const data = {
      paper_id: _req['paper_id'],
      content: _req['content'],
      audio_id: _req['audio_id'],
      picture: _req['picture'],
      questions: _req['questions'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/examination/question_option
   *
   * 创建选项
   */
  CreateQuestionOption(
    req: entity.CreateQuestionOptionReq,
    options?: T,
  ): Promise<entity.CreateQuestionOptionResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/question_option');
    const method = 'POST';
    const data = {
      paper_question_id: _req['paper_question_id'],
      content: _req['content'],
      is_correct: _req['is_correct'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/examination/question
   *
   * 创建题目
   */
  CreateQuestion(
    req: entity.CreateQuestionReq,
    options?: T,
  ): Promise<entity.CreateQuestionResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/question');
    const method = 'POST';
    const data = {
      paper_question_group_id: _req['paper_question_group_id'],
      content: _req['content'],
      question_options: _req['question_options'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * PUT /api/examination/question_group
   *
   * 更新题目组
   */
  UpdateQuestionGroup(
    req: entity.UpdateQuestionGroupReq,
    options?: T,
  ): Promise<entity.UpdateQuestionGroupResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/question_group');
    const method = 'PUT';
    const data = {
      id: _req['id'],
      content: _req['content'],
      audio_id: _req['audio_id'],
      picture: _req['picture'],
      questions: _req['questions'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/question_group
   *
   * 获取试卷的题目组列表
   */
  ListQuestionGroup(
    req: entity.ListQuestionGroupReq,
    options?: T,
  ): Promise<entity.ListQuestionGroupResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/question_group');
    const method = 'GET';
    const params = { paper_id: _req['paper_id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * DELETE /api/examination/question_group/:id
   *
   * 删除题目组
   */
  DeleteQuestionGroup(
    req: entity.DeleteQuestionGroupReq,
    options?: T,
  ): Promise<entity.DeleteQuestionGroupResp> {
    const _req = req;
    const url = this.genBaseURL(
      `/api/examination/question_group/${_req['id']}`,
    );
    const method = 'DELETE';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/examination/paper_exam
   *
   * 获取测试名单
   */
  ListUserPaperExamination(
    req?: entity.ListUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.ListUserPaperExaminationResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/paper_exam');
    const method = 'GET';
    const params = {
      page: _req['page'],
      page_size: _req['page_size'],
      base: _req['base'],
    };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/examination/paper_exam
   *
   * 录入测试名单
   */
  BatchCreateUserPaperExamination(
    req: entity.BatchCreateUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.BatchCreateUserPaperExaminationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/paper_exam');
    const method = 'POST';
    const data = { paper_exams: _req['paper_exams'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * PUT /api/examination/paper_exam
   *
   * 更新测试名单
   */
  UpdateUserPaperExamination(
    req: entity.UpdateUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.UpdateUserPaperExaminationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/paper_exam');
    const method = 'PUT';
    const data = {
      id: _req['id'],
      level: _req['level'],
      paper_id: _req['paper_id'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/paper_exam/export
   *
   * 导出测试记录到 Excel 文件
   */
  ExportUserPaperExamination(
    req?: entity.ExportUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.ExportUserPaperExaminationResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/paper_exam/export');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * DELETE /api/examination/paper_exam/:id
   *
   * 删除测试名单
   */
  DeleteUserPaperExamination(
    req: entity.DeleteUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.DeleteUserPaperExaminationResp> {
    const _req = req;
    const url = this.genBaseURL(`/api/examination/paper_exam/${_req['id']}`);
    const method = 'DELETE';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/examination/paper_for_exam
   *
   * 获取可选的试卷列表
   */
  ListPaperForExam(
    req: entity.ListPaperForExamReq,
    options?: T,
  ): Promise<entity.ListPaperForExamResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/paper_for_exam');
    const method = 'GET';
    const params = { paper_exam_id: _req['paper_exam_id'], base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/examination/paper_exam/parse
   *
   * 解析测试名单 Excel 表格
   */
  ParseUserPaperExamination(
    req: entity.ParseUserPaperExaminationReq,
    options?: T,
  ): Promise<entity.ParseUserPaperExaminationResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/paper_exam/parse');
    const method = 'POST';
    const data = { excel_id: _req['excel_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/video/token
   *
   * 下发上传视频的 token
   */
  GetUploadVideoToken(
    req?: entity.GetUploadVideoTokenReq,
    options?: T,
  ): Promise<entity.GetUploadVideoTokenResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/video/token');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/examination/video/play
   *
   * 播放视频
   */
  GetPlayVideoInfo(
    req: entity.GetPlayVideoInfoReq,
    options?: T,
  ): Promise<entity.GetPlayVideoInfoResp> {
    const _req = req;
    const url = this.genBaseURL('/api/examination/video/play');
    const method = 'POST';
    const data = { vids: _req['vids'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/myexam/list
   *
   * 获取我的考试资格
   */
  GetMyPaperExam(
    req?: entity.GetMyPaperExamReq,
    options?: T,
  ): Promise<entity.GetMyPaperExamResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/myexam/list');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * POST /api/examination/myexam/answer
   *
   * 提交作答
   */
  AnswerMyPaperExamQuestion(
    req?: entity.AnswerMyPaperExamQuestionReq,
    options?: T,
  ): Promise<entity.AnswerMyPaperExamQuestionResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/myexam/answer');
    const method = 'POST';
    const data = {
      paper_exam_id: _req['paper_exam_id'],
      question_answers: _req['question_answers'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/examination/myexam/start
   *
   * 开始考试，获取考题
   */
  StartMyPaperExam(
    req?: entity.StartMyPaperExamReq,
    options?: T,
  ): Promise<entity.StartMyPaperExamResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/myexam/start');
    const method = 'POST';
    const data = { base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/examination/myexam/submit
   *
   * 提交试卷
   */
  SubmitMyPaperExam(
    req?: entity.SubmitMyPaperExamReq,
    options?: T,
  ): Promise<entity.SubmitMyPaperExamResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/myexam/submit');
    const method = 'POST';
    const data = {
      paper_exam_id: _req['paper_exam_id'],
      video_id: _req['video_id'],
      force_submit: _req['force_submit'],
      base: _req['base'],
    };
    return this.request({ url, method, data }, options);
  }

  /**
   * POST /api/examination/myexam/leave
   *
   * 切屏上报
   */
  ReportLeaveScreen(
    req?: entity.ReportLeaveScreenReq,
    options?: T,
  ): Promise<entity.ReportLeaveScreenResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/myexam/leave');
    const method = 'POST';
    const data = { paper_exam_id: _req['paper_exam_id'], base: _req['base'] };
    return this.request({ url, method, data }, options);
  }

  /**
   * GET /api/examination/check/admin
   *
   * 检查管理员权限
   */
  CheckAdminPermission(
    req?: entity.CheckAdminPermissionReq,
    options?: T,
  ): Promise<entity.CheckAdminPermissionResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/check/admin');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }

  /**
   * GET /api/examination/check/alpha
   *
   * 检查管理员权限
   */
  CheckAlphaTestPermission(
    req?: entity.CheckAlphaTestPermissionReq,
    options?: T,
  ): Promise<entity.CheckAlphaTestPermissionResp> {
    const _req = req || {};
    const url = this.genBaseURL('/api/examination/check/alpha');
    const method = 'GET';
    const params = { base: _req['base'] };
    return this.request({ url, method, params }, options);
  }
}
/* eslint-enable */
