/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface GetCityRankListRequest {
  city: string;
  poi_type: string;
  sub_poi_type: string;
  district: string;
  rank_type?: string;
  longitude?: number;
  latitude?: number;
}

export interface GetCityRankListResponse {
  code?: number;
  msg?: string;
  response_for_model?: string;
}

export interface GetCityRankListTypeRequest {
  city_code?: string;
  city?: string;
  longitude?: number;
  latitude?: number;
}

export interface GetCityRankListTypeResponse {
  code?: number;
  msg?: string;
  response_for_model?: string;
}

export interface GetPoiDetailRequest {
  poi_id: string;
  longitude?: number;
  latitude?: number;
}

export interface GetPoiDetailResponse {
  code?: number;
  msg?: string;
  response_for_model?: string;
}

export interface GetPoiRateFeedRequest {
  poi_id: string;
}

export interface GetPoiRateFeedResponse {
  code?: number;
  msg?: string;
  response_for_model?: string;
}

export interface GetSearchListRequest {
  query: string;
  city?: string;
  longitude?: number;
  latitude?: number;
}

export interface GetSearchListResponse {
  code?: number;
  msg?: string;
  response_for_model?: string;
}
/* eslint-enable */
