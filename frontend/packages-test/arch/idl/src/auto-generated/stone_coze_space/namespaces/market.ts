/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum DiggType {
  DiggTypeDigg = 1,
  DiggTypeBury = 2,
}

export interface DiggRequest {
  agent_id: Int64;
  action_type: DiggType;
  is_cancel?: boolean;
}

export interface DiggResponse {
  code?: Int64;
  msg?: string;
}

export interface ExpertProduct {
  agent_id?: Int64;
  name?: string;
  desc?: string;
  avatar_url?: string;
}

export interface ExpertProductDetailsRequest {
  agent_id: Int64;
}

export interface ExpertProductDetailsResponse {
  code?: Int64;
  msg?: string;
  data?: ExpertProductDetailsResponseData;
}

export interface ExpertProductDetailsResponseData {
  agent_name?: string;
  agent_desc?: string;
  avatar_url?: string;
  user_count?: Int64;
  /** minute */
  avg_time_cost?: Int64;
  digg_count?: Int64;
  bury_count?: Int64;
  /** 空不展示 */
  evaluation?: string;
  agent_intro?: string;
  examples?: Array<ExpertProductExample>;
  company_name?: string;
}

export interface ExpertProductExample {
  title?: string;
  desc?: string;
  url?: string;
  share_link?: string;
}

export interface ExpertProductListRequest {}

export interface ExpertProductListResponse {
  code?: Int64;
  msg?: string;
  data?: ExpertProductListResponseData;
}

export interface ExpertProductListResponseData {
  products?: Array<ExpertProduct>;
}

export interface FeatureHighlights {
  title?: string;
  content?: string;
  use_cases?: Array<UseCases>;
}

export interface LandingPageRequest {}

export interface LandingPageResponse {
  code?: Int64;
  msg?: string;
  data?: LandingPageResponseData;
}

export interface LandingPageResponseData {
  feature_highlights?: Array<FeatureHighlights>;
  user_shares?: Array<UserShare>;
}

export interface UseCases {
  label?: string;
  title?: string;
  content?: string;
  results_preview_url?: string;
  share_link?: string;
}

export interface UserShare {
  avatar_url?: string;
  nickname?: string;
  query?: string;
  share_link?: string;
}
/* eslint-enable */
