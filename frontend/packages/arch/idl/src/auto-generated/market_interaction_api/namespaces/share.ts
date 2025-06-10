/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as flow_marketplace_interaction_common from './flow_marketplace_interaction_common';

export type Int64 = string | number;

export interface GetShareInfoByBIDData {
  ShareLinkData?: ShareLinkData;
}

export interface GetShareLinkData {
  BID?: string;
}

export interface GetShareLinkDataV2 {
  BID?: string;
  ShareChannels?: Array<flow_marketplace_interaction_common.ShareChannel>;
}

export interface GetShareLinkRequest {
  entity_id: string;
  entity_type: flow_marketplace_interaction_common.InteractionEntityType;
}

export interface GetShareLinkResponse {
  code?: number;
  msg?: string;
  data: GetShareLinkData;
}

export interface GetShareLinkV2Request {
  entity_id: string;
  entity_type: flow_marketplace_interaction_common.InteractionEntityType;
  invitation_method: flow_marketplace_interaction_common.InvitationMethod;
}

export interface GetShareLinkV2Response {
  code?: number;
  msg?: string;
  data: GetShareLinkDataV2;
}

export interface GetShortURLData {
  ShortURLs?: Record<string, string>;
}

export interface GetShortURLRequest {
  source_urls: Array<string>;
}

export interface GetShortURLResponse {
  code?: number;
  msg?: string;
  data: GetShortURLData;
}

/** ----------------------------- RPC ----------------------------- */
export interface ShareLinkData {
  EntityID?: Int64;
  EntityType?: flow_marketplace_interaction_common.InteractionEntityType;
  SharerID?: Int64;
  CreatedTime?: Int64;
  Ticket?: Int64;
  BaseParam?: string;
  InvitationMethod?: string;
}
/* eslint-enable */
