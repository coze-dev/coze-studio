/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum StyleStatus {
  Dark = 1,
  Light = 2,
}

export enum TaskStatus {
  Active = 1,
  Delete = 2,
}

export interface BannerConfig {
  image_uri?: string;
  image_url?: string;
  /** 主标题 */
  main_title?: string;
  /** 副标题 */
  sub_title?: string;
  button_text?: string;
  button_url?: string;
  start_time?: string;
  end_time?: string;
  /** 风格 1-暗黑 2-明亮 */
  style?: StyleStatus;
}

export interface CreateBannerConfig {
  image_uri?: string;
  /** 主标题 */
  main_title?: string;
  /** 副标题 */
  sub_title?: string;
  button_text?: string;
  button_url?: string;
  start_time?: string;
  end_time?: string;
  /** 风格 1-暗黑 2-明亮 */
  style?: StyleStatus;
}

export interface CreateHomeBannerTaskRequest {
  task_name: string;
  banner_list: Array<CreateBannerConfig>;
}

export interface CreateHomeBannerTaskResponse {
  data: TaskBaseInfo;
  code: Int64;
  msg: string;
}

export interface GetHomeBannerTaskListRequest {
  task_id?: string;
  task_name?: string;
  task_status?: TaskStatus;
  page?: number;
  size?: number;
}

export interface GetHomeBannerTaskListResponse {
  data: HomeBannerTaskList;
  code: Int64;
  msg: string;
}

export interface HomeBannerTaskConfig {
  task_id?: string;
  task_name?: string;
  task_start_time?: Int64;
  task_end_time?: Int64;
  creator?: string;
  operator?: string;
  banner_list?: Array<BannerConfig>;
  create_time?: Int64;
}

export interface HomeBannerTaskList {
  home_banner_task_list?: Array<HomeBannerTaskConfig>;
  total?: number;
}

export interface ImageInfo {
  uri?: string;
  url?: string;
}

export interface ImageXUploadRequest {
  file_info: string;
  file_suffix: string;
}

export interface ImageXUploadResponse {
  data: ImageInfo;
  code: Int64;
  msg: string;
}

export interface TaskBaseInfo {
  task_id?: Int64;
  task_start_time?: Int64;
  task_end_time?: Int64;
  creator?: string;
  operator?: string;
  create_time?: Int64;
}

export interface UpdateHomeBannerTaskRequest {
  task_id: string;
  task_name?: string;
  /** banner task状态，1-生效，2-删除 */
  task_status?: TaskStatus;
  banner_list?: Array<CreateBannerConfig>;
}

export interface UpdateHomeBannerTaskResponse {
  code: Int64;
  msg: string;
}
/* eslint-enable */
