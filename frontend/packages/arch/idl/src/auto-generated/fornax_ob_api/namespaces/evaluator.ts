/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum BuiltinTemplateType {
  Prompt = 1,
  Code = 2,
}

export enum EvaluatorRunStatus {
  /** 运行状态, 异步下状态流转, 同步下只有 Success / Fail */
  Unknown = 0,
  Success = 1,
  Fail = 2,
}

export enum EvaluatorType {
  Prompt = 1,
  Code = 2,
}

export enum LanguageType {
  Python = 1,
  JS = 2,
}

export enum PromptSourceType {
  BuiltinTemplate = 1,
  FornaxPrompt = 2,
  Custom = 3,
}

export enum ToolType {
  Function = 1,
  /** for gemini native tool */
  GoogleSearch = 2,
}
/* eslint-enable */
