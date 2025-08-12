/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Node base type definition
 */
export enum StandardNodeType {
  Start = '1',
  End = '2',
  LLM = '3',
  Api = '4',
  Code = '5',
  Dataset = '6',
  If = '8',
  SubWorkflow = '9',
  Variable = '11',
  Database = '12',
  Output = '13',
  Imageflow = '14',
  Text = '15',
  ImageGenerate = '16',
  ImageReference = '17',
  Question = '18',
  Break = '19',
  SetVariable = '20',
  Loop = '21',
  Intent = '22',
  // For new nodes, StandardNodeType can be written in text form, without relying on NodeTemplateType.
  ImageCanvas = '23',
  SceneChat = '25',
  SceneVariable = '24',

  /** Long term memory */
  LTM = '26',
  /** database write node */
  DatasetWrite = '27',
  Batch = '28',

  Continue = '29',
  // input node
  Input = '30',

  Comment = '31',
  // variable aggregation
  VariableMerge = '32',
  // Query message list
  QueryMessageList = '37',
  // clear the context node
  ClearContext = '38',
  // Create a session node
  CreateConversation = '39',

  // Trigger CURD 4 nodes
  // TriggerCreate = '33',
  // TriggerUpdate = '34',
  TriggerUpsert = '34',
  TriggerDelete = '35',
  TriggerRead = '36',

  VariableAssign = '40',

  // HTTP Node
  Http = '45',
  // Database crud node

  DatabaseUpdate = '42',
  DatabaseQuery = '43',
  DatabaseDelete = '44',
  DatabaseCreate = '46',

  // Update session
  UpdateConversation = '51',

  // Delete session
  DeleteConversation = '52',

  // Query session list
  QueryConversationList = '53',

  // Query session history
  QueryConversationHistory = '54',

  // Create a message (a conversation)
  CreateMessage = '55',

  // Update message (a message for a session)
  UpdateMessage = '56',

  // Delete a message (a message for a session)
  DeleteMessage = '57',

  JsonStringify = '58',
  JsonParser = '59',
}

/**
 * Basic node types other than APIs, SubWorkflow, and Imageflow
 */
export type BasicStandardNodeTypes = Exclude<
  StandardNodeType,
  | StandardNodeType.Api
  | StandardNodeType.Imageflow
  | StandardNodeType.SubWorkflow
>;

/** Node display sorting */
export const NODE_ORDER = {
  [StandardNodeType.Start]: 1,
  [StandardNodeType.End]: 2,
  [StandardNodeType.Api]: 3,
  [StandardNodeType.LLM]: 4,
  [StandardNodeType.Code]: 5,
  [StandardNodeType.Dataset]: 6,
  [StandardNodeType.SubWorkflow]: 7,
  [StandardNodeType.Imageflow]: 8,
  [StandardNodeType.If]: 9,
  [StandardNodeType.Loop]: 10,
  [StandardNodeType.Intent]: 11,
  [StandardNodeType.Text]: 12,
  [StandardNodeType.Output]: 13,
  [StandardNodeType.Question]: 14,
  [StandardNodeType.Variable]: 15,
  [StandardNodeType.Database]: 16,
  [StandardNodeType.LTM]: 17,
  [StandardNodeType.Batch]: 18,
  [StandardNodeType.Input]: 19,
  [StandardNodeType.SetVariable]: 20,
  [StandardNodeType.Break]: 21,
  [StandardNodeType.Continue]: 22,
  [StandardNodeType.SceneChat]: 23,
  [StandardNodeType.SceneVariable]: 24,
  // [StandardNodeType.TriggerCreate]: 25,
  [StandardNodeType.TriggerUpsert]: 26,
  [StandardNodeType.TriggerRead]: 27,
  [StandardNodeType.TriggerDelete]: 28,
};

/** session class node */
export const CONVERSATION_NODES = [
  StandardNodeType.CreateConversation,
  StandardNodeType.UpdateConversation,
  StandardNodeType.DeleteConversation,
  StandardNodeType.QueryConversationList,
];

/** message class node */
export const MESSAGE_NODES = [
  StandardNodeType.CreateMessage,
  StandardNodeType.UpdateMessage,
  StandardNodeType.DeleteMessage,
  StandardNodeType.QueryMessageList,
];

/** session history class node */
export const CONVERSATION_HISTORY_NODES = [
  StandardNodeType.QueryConversationHistory,
  StandardNodeType.ClearContext,
];
