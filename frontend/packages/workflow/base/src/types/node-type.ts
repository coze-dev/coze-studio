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
 * 节点基础类型定义
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
  // 对于新节点，可以使用文本的形式来编写 StandardNodeType，不再依赖 NodeTemplateType
  ImageCanvas = '23',
  SceneChat = '25',
  SceneVariable = '24',

  /** 长期记忆，long term memory */
  LTM = '26',
  /** 数据库写入节点 */
  DatasetWrite = '27',
  Batch = '28',

  Continue = '29',
  // 输入节点
  Input = '30',

  Comment = '31',
  // 变量聚合
  VariableMerge = '32',
  // 查询消息列表
  QueryMessageList = '37',
  // 清空上下文节点
  ClearContext = '38',
  // 创建会话节点
  CreateConversation = '39',

  // 触发器 CURD 4个节点
  // TriggerCreate = '33',
  // TriggerUpdate = '34',
  TriggerUpsert = '34',
  TriggerDelete = '35',
  TriggerRead = '36',

  VariableAssign = '40',

  // http 节点
  Http = '45',
  // 数据库 crud 节点

  DatabaseUpdate = '42',
  DatabaseQuery = '43',
  DatabaseDelete = '44',
  DatabaseCreate = '46',

  // 更新会话
  UpdateConversation = '51',

  // 删除会话
  DeleteConversation = '52',

  // 查询会话列表
  QueryConversationList = '53',

  // 查询会话历史
  QueryConversationHistory = '54',

  // 创建消息（某个会话）
  CreateMessage = '55',

  // 更新消息（某个会话的某个消息）
  UpdateMessage = '56',

  // 删除消息（某个会话的某个消息）
  DeleteMessage = '57',

  JsonStringify = '58',
  JsonParser = '59',
}

/**
 * 除了 Api、SubWorkflow、Imageflow 之外的基础节点类型
 */
export type BasicStandardNodeTypes = Exclude<
  StandardNodeType,
  | StandardNodeType.Api
  | StandardNodeType.Imageflow
  | StandardNodeType.SubWorkflow
>;

/** 节点展示排序 */
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

/** 会话类节点 */
export const CONVERSATION_NODES = [
  StandardNodeType.CreateConversation,
  StandardNodeType.UpdateConversation,
  StandardNodeType.DeleteConversation,
  StandardNodeType.QueryConversationList,
];

/** 消息类节点 */
export const MESSAGE_NODES = [
  StandardNodeType.CreateMessage,
  StandardNodeType.UpdateMessage,
  StandardNodeType.DeleteMessage,
  StandardNodeType.QueryMessageList,
];

/** 会话历史类节点 */
export const CONVERSATION_HISTORY_NODES = [
  StandardNodeType.QueryConversationHistory,
  StandardNodeType.ClearContext,
];
