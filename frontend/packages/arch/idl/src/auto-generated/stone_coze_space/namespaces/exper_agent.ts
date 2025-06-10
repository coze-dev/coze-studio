/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface AuthorizedChannel {
  name?: string;
  icon?: string;
  url_code?: string;
  web_url?: string;
}

export interface AuthorizedChannelMatchData {
  channel_list?: Array<AuthorizedChannel>;
}

export interface AuthorizedChannelMatchRequest {
  web_rul?: string;
}

export interface AuthorizedChannelMatchResponse {
  code?: Int64;
  msg?: string;
  data?: AuthorizedChannelMatchData;
}

export interface GenerateRelatedWordsData {
  related_words?: Array<RelatedWord>;
}

export interface GenerateRelatedWordsRequest {
  original_word?: string;
  describe?: string;
}

export interface GenerateRelatedWordsResponse {
  code?: Int64;
  msg?: string;
  data?: GenerateRelatedWordsData;
}

export interface RelatedWord {
  intent?: string;
  keywords?: Array<string>;
}
/* eslint-enable */
