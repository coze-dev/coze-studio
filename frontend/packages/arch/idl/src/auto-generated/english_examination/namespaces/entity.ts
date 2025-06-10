/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as common from './common';

export type Int64 = string | number;

export interface AnswerMyPaperExamQuestionReq {
  paper_exam_id?: Int64;
  question_answers?: Record<Int64, Array<Int64>>;
  base?: base.Base;
}

export interface AnswerMyPaperExamQuestionResp {
  paper_exam_answers?: Array<common.PaperExamAnswer>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface BatchCreateUserPaperExaminationReq {
  /** 考试名单列表 */
  paper_exams: Array<common.CreatePaperExamParams>;
  base?: base.Base;
}

export interface BatchCreateUserPaperExaminationResp {
  /** 成功列表 */
  success_list?: Array<common.PaperExam>;
  /** 失败列表 */
  fail_list?: Array<string>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CheckAdminPermissionReq {
  base?: base.Base;
}

export interface CheckAdminPermissionResp {
  is_admin?: boolean;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CheckAlphaTestPermissionReq {
  base?: base.Base;
}

export interface CheckAlphaTestPermissionResp {
  is_alpha?: boolean;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CreatePaperReq {
  /** 试卷名称 */
  name: string;
  /** 试卷难度 */
  level: common.PaperLevel;
  base?: base.Base;
}

export interface CreatePaperResp {
  paper?: common.Paper;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CreateQuestionGroupReq {
  /** 试卷ID */
  paper_id: Int64;
  /** 题干 */
  content: string;
  /** 关联音频 */
  audio_id?: string;
  /** 关联图片 */
  picture?: string;
  /** 题目列表 */
  questions?: Array<common.CreatePaperQuestionParams>;
  base?: base.Base;
}

export interface CreateQuestionGroupResp {
  question_group?: common.PaperQuestionGroup;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CreateQuestionOptionReq {
  /** 题目ID */
  paper_question_id: Int64;
  /** 选项内容 */
  content: string;
  /** 是否正确 */
  is_correct: common.QuestionOptionCorrectStatus;
  base?: base.Base;
}

export interface CreateQuestionOptionResp {
  question_option?: common.PaperQuestionOption;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface CreateQuestionReq {
  /** 题目组ID */
  paper_question_group_id: Int64;
  /** 题干 */
  content: string;
  /** 选项列表 */
  question_options?: Array<common.CreatePaperQuestionOptionParams>;
  base?: base.Base;
}

export interface CreateQuestionResp {
  question?: common.PaperQuestion;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface DeletePaperReq {
  /** 试卷ID */
  id: number;
  base?: base.Base;
}

export interface DeletePaperResp {
  paper?: common.Paper;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface DeleteQuestionGroupReq {
  /** 题目组ID */
  id: Int64;
  base?: base.Base;
}

export interface DeleteQuestionGroupResp {
  question_group?: common.PaperQuestionGroup;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface DeleteUserPaperExaminationReq {
  /** ID */
  id: Int64;
  base?: base.Base;
}

export interface DeleteUserPaperExaminationResp {
  paper_exam?: common.PaperExam;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ExportUserPaperExaminationReq {
  base?: base.Base;
}

export interface ExportUserPaperExaminationResp {
  /** 导出结果 tos 文件 */
  excel_id?: string;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface GetMyPaperExamReq {
  base?: base.Base;
}

export interface GetMyPaperExamResp {
  exams?: Array<common.PaperExam>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface GetPlayVideoInfoReq {
  vids: Array<string>;
  base?: base.Base;
}

export interface GetPlayVideoInfoResp {
  play_info_map?: Record<string, common.PlayInfo>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface GetSessionUserInfoReq {
  'x-innovation-token'?: string;
  base?: base.Base;
}

export interface GetSessionUserInfoResp {
  id?: Int64;
  lark_name?: string;
  lark_email?: string;
  lark_union_id?: string;
  lark_open_id?: string;
  lark_user_id?: string;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface GetUploadVideoTokenReq {
  base?: base.Base;
}

export interface GetUploadVideoTokenResp {
  access_key_id?: string;
  secret_access_key?: string;
  session_token?: string;
  expired_time?: string;
  current_time?: string;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ListPaperForExamReq {
  /** 考试ID */
  paper_exam_id: Int64;
  base?: base.Base;
}

export interface ListPaperForExamResp {
  papers?: Array<common.Paper>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ListPaperReq {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 试卷状态 */
  status?: common.PaperStatus;
  /** 试卷难度 */
  level?: common.PaperLevel;
  base?: base.Base;
}

export interface ListPaperResp {
  papers?: Array<common.Paper>;
  total?: number;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ListQuestionGroupReq {
  /** 试卷ID */
  paper_id: Int64;
  base?: base.Base;
}

export interface ListQuestionGroupResp {
  question_groups?: Array<common.PaperQuestionGroup>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ListUserPaperExaminationReq {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  base?: base.Base;
}

export interface ListUserPaperExaminationResp {
  paper_exams?: Array<common.PaperExam>;
  total?: number;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface LoginByJwtReq {
  authorization: string;
  base?: base.Base;
}

export interface LoginByJwtResp {
  base_resp?: base.BaseResp;
}

export interface LoginReq {
  code?: string;
  state?: string;
  session_id?: string;
  base?: base.Base;
}

export interface LoginResp {
  base_resp?: base.BaseResp;
}

export interface ParseUserPaperExaminationReq {
  /** 名单表格文件 tos 文件 */
  excel_id: string;
  base?: base.Base;
}

export interface ParseUserPaperExaminationResp {
  results?: Array<common.PaperExamParseResult>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface ReportLeaveScreenReq {
  paper_exam_id?: Int64;
  base?: base.Base;
}

export interface ReportLeaveScreenResp {
  leave_count?: number;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface StartMyPaperExamReq {
  base?: base.Base;
}

export interface StartMyPaperExamResp {
  paper_exam?: common.PaperExam;
  question_groups?: Array<common.PaperQuestionGroup>;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface SubmitMyPaperExamReq {
  paper_exam_id?: Int64;
  video_id?: string;
  force_submit?: boolean;
  base?: base.Base;
}

export interface SubmitMyPaperExamResp {
  paper_exam?: common.PaperExam;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface UpdatePaperReq {
  /** 试卷ID */
  id?: Int64;
  /** 试卷名称 */
  name?: string;
  /** 试卷难度 */
  level?: common.PaperLevel;
  /** 试卷状态 */
  status?: common.PaperStatus;
  base?: base.Base;
}

export interface UpdatePaperResp {
  paper?: common.Paper;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface UpdateQuestionGroupReq {
  /** 试题组ID */
  id: Int64;
  /** 题干 */
  content?: string;
  /** 关联音频 */
  audio_id?: string;
  /** 关联图片 */
  picture?: string;
  /** 题目列表 */
  questions?: Array<common.UpdatePaperQuestionParams>;
  base?: base.Base;
}

export interface UpdateQuestionGroupResp {
  question_group?: common.PaperQuestionGroup;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}

export interface UpdateUserPaperExaminationReq {
  /** ID */
  id: Int64;
  /** 试卷难度 */
  level?: common.PaperLevel;
  /** 试卷 */
  paper_id?: Int64;
  base?: base.Base;
}

export interface UpdateUserPaperExaminationResp {
  paper_exam?: common.PaperExam;
  code?: number;
  message?: string;
  base_resp?: base.BaseResp;
}
/* eslint-enable */
