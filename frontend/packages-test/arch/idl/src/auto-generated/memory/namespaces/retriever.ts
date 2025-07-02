/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as copilot_common from './copilot_common';

export type Int64 = string | number;

export enum PromptTemplateFormat {
  FString = 1,
  Jinja2 = 2,
  GoTemplate = 3,
}

export enum ReferenceType {
  DocumentReference = 1,
}

export enum ResultType {
  PluginResponse = 1,
  PluginIntent = 2,
  Variables = 3,
  None = 4,
  BotSchema = 5,
  ReferenceVariable = 6,
  /** 使用retriever的内容回复answer包，不走大模型 */
  Finish = 7,
}

export enum RetrieverType {
  Plugin = 1,
  PluginAsService = 2,
  Service = 3,
}

export interface Message {
  conversation_id?: Int64;
  section_id?: Int64;
  message_id?: Int64;
  content?: string;
  role?: copilot_common.CopilotRole;
  location?: copilot_common.LocationInfo;
  files?: Array<copilot_common.FileInfo>;
  images?: Array<copilot_common.ImageInfo>;
}
/* eslint-enable */
