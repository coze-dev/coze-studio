/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';
import * as base from './base';

export type Int64 = string | number;

export interface CreateDocumentReviewRequest {
  dataset_id?: string;
  reviews?: Array<ReviewInput>;
  chunk_strategy?: common.ChunkStrategy;
  parsing_strategy?: common.ParsingStrategy;
  Base?: base.Base;
}

export interface CreateDocumentReviewResponse {
  dataset_id?: string;
  reviews?: Array<Review>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface MGetDocumentReviewRequest {
  dataset_id?: string;
  review_ids?: Array<string>;
  Base?: base.Base;
}

export interface MGetDocumentReviewResponse {
  dataset_id?: string;
  reviews?: Array<Review>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface Review {
  review_id?: string;
  document_name?: string;
  document_type?: string;
  tos_url?: string;
  /** 状态 */
  status?: common.ReviewStatus;
  doc_tree_tos_url?: string;
  preview_tos_url?: string;
}

export interface ReviewInput {
  document_name?: string;
  document_type?: string;
  tos_uri?: string;
  document_id?: string;
}

export interface SaveDocumentReviewRequest {
  dataset_id?: string;
  review_id?: string;
  doc_tree_json?: string;
  Base?: base.Base;
}

export interface SaveDocumentReviewResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}
/* eslint-enable */
