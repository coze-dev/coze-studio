/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum BannerRegionType {
  Inhouse = 1,
  Release = 2,
  InhouseAndRelease = 3,
}

export enum BannerStatus {
  /** 草稿 */
  Draft = 1,
  /** 展示中 */
  PublishedOnDisplay = 2,
  /** 即将展示 */
  PublishedToDisplay = 3,
  /** 已下线 */
  Offline = 4,
  /** 已结束 */
  End = 5,
}

export enum UpdateBannerActionType {
  Create = 1,
  Update = 2,
  Publish = 3,
  CreateAndPublish = 4,
  Delete = 5,
  Offline = 6,
}

export interface Banner {
  banner_id?: string;
  banner_content?: string;
  color_scheme?: string;
  region?: BannerRegionType;
  start_time?: Int64;
  end_time?: Int64;
  operator_email?: string;
  status?: BannerStatus;
  create_time?: Int64;
  update_time?: Int64;
  timezone?: string;
}

export interface GetBannerListData {
  total: Int64;
  banner_list: Array<Banner>;
}

export interface GetBannerListRequest {
  /** 分页 */
  page?: number;
  /** 分页大小 */
  size?: number;
}

export interface GetBannerListResponse {
  data?: GetBannerListData;
  code: Int64;
  msg: string;
}

export interface UpdateBannerRequest {
  /** create/createAndPublish时，除了banner_id，其余必传
delete/oofline只需要传banner_id
publish/update必传banner_id，其他字段看情况传 */
  action_type: UpdateBannerActionType;
  /** Update/Delete必传 */
  banner_id?: string;
  /** create必传 */
  banner_content?: string;
  /** create必传 */
  color_scheme?: string;
  /** create必传 */
  region?: BannerRegionType;
  start_time?: Int64;
  end_time?: Int64;
  timezone?: string;
}

export interface UpdateBannerResponse {
  code: Int64;
  msg: string;
}
/* eslint-enable */
