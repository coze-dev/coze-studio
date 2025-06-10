/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface ArticleInfo {
  title?: string;
  url?: string;
  description?: string;
  publishedAt?: string;
  content?: string;
}

export interface NewsInfo {
  title: string;
  cover: string;
  time: string;
  url: string;
  summary: string;
  media_name?: string;
  categories?: Array<string>;
}

export interface SearchEverythingRequest {
  q: string;
  language?: string;
}

export interface SearchEverythingResponse {
  articles?: Array<ArticleInfo>;
}

export interface SearchTTNewsRequest {
  q: string;
}

export interface SearchTTNewsResponse {
  news?: Array<NewsInfo>;
  code?: string;
  msg?: string;
}
/* eslint-enable */
