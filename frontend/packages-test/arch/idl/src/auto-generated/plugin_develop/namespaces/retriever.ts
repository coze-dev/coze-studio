/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

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
}

export enum RetrieverType {
  Plugin = 1,
  PluginAsService = 2,
  Service = 3,
}
/* eslint-enable */
