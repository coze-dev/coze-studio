/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AttributeValueType {
  Unknown = 0,
  String = 1,
  Boolean = 2,
  StringList = 11,
  BooleanList = 12,
}

export enum ResourceType {
  Account = 1,
  Workspace = 2,
  App = 3,
  Bot = 4,
  Plugin = 5,
  Workflow = 6,
  Knowledge = 7,
  PersonalAccessToken = 8,
  Connector = 9,
  Card = 10,
  CardTemplate = 11,
  Conversation = 12,
  File = 13,
  ServicePrincipal = 14,
  Enterprise = 15,
  MigrateTask = 16,
  Prompt = 17,
  UI = 18,
  Project = 19,
  EvaluationDataset = 20,
  EvaluationTask = 21,
  Evaluator = 22,
  Database = 23,
  OceanProject = 24,
  FinetuneTask = 25,
  LoopPrompt = 26,
  LoopEvaluationExperiment = 27,
  LoopEvaluationSet = 28,
  LoopEvaluator = 29,
  LoopEvaluationTarget = 30,
  LoopTraceView = 31,
  LoopModel = 32,
}

export interface AttributeValue {
  Type: AttributeValueType;
  Value: string;
}

export interface ResourceIdentifier {
  /** 资源类型 */
  Type: ResourceType;
  /** 资源Id */
  Id: string;
}
/* eslint-enable */
