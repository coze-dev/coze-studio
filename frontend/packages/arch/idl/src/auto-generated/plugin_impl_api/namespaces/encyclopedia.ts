/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface EncyclopediaItem {
  title?: string;
  url?: string;
  desc?: string;
  image_url?: string;
  source?: string;
}

export interface SearchEncyclopediaRequest {
  keyword: string;
}

export interface SearchEncyclopediaResponse {
  response_type?: string;
  template_id?: string;
  response_for_model?: string;
  code?: number;
  msg?: string;
  data?: EncyclopediaItem;
}
/* eslint-enable */
