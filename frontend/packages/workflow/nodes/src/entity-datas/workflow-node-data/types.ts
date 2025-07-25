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
 
import {
  type StandardNodeType,
  type BasicStandardNodeTypes,
  type DTODefine,
} from '@coze-workflow/base/types';
import { type ReleasedWorkflow } from '@coze-arch/bot-api/workflow_api';

import { type ApiNodeDetailDTO } from '../../typings';

/**
 * api 节点上存储的 api 的相关数据
 */
export type ApiNodeData = CommonNodeData &
  Readonly<
    Partial<ApiNodeDetailDTO> & {
      /**
       * 项目内插件节点需要保存 projectId
       */
      projectId?: string;
      /** 该插件的最新版本的时间戳 */
      latestVersionTs?: string;
      /** 插件最新版本的展示名称，形如 v1.0.0 */
      latestVersionName?: string;
      /** 该插件当前版本的展示名称，形如 v1.0.0 */
      versionName?: string;
    }
  >;

/**
 * 子流程节点上存储的相关数据
 */
export type SubWorkflowNodeData = CommonNodeData &
  Readonly<Omit<ReleasedWorkflow, 'inputs' | 'outputs'>> & {
    /** 子流程节点输入定义 */
    inputsDefinition: DTODefine.InputVariableDTO[];
    /**
     * 项目内子流程需要保存 projectId
     */
    projectId?: string;
    /** 该子流程的最新版本 */
    latestVersion?: string;
  };

export type QuestionNodeData = CommonNodeData & {
  question: string;
  options: any;
  answerType: string;
};

/**
 * 通用节点类型的相关数据
 * 基础节点定义见类型 BasicStandardNodeTypes
 */
export interface CommonNodeData {
  /**
   *
   * 节点图标
   */
  readonly icon: string;
  /**
   * 节点描述
   */
  description: string;
  /**
   * 节点标题
   */
  title: string;
  /**
   * 节点主色
   */
  mainColor: string;
}

export enum LLMNodeDataSkillType {
  Plugin = 1,
  Workflow = 4,
  Dataset = 3,
}

export interface LLMNodeDataPluginSkill {
  type: LLMNodeDataSkillType.Plugin;
  pluginId?: string;
  pluginName?: string;
  apiId?: string;
  apiName?: string;
  icon?: string;
}

export interface LLMNodeDataWorkflowSkill {
  type: LLMNodeDataSkillType.Workflow;
  workflowId: string;
  pluginId?: string;
  name?: string;
  icon?: string;
}

export interface LLMNodeDataDatasetSkill {
  type: LLMNodeDataSkillType.Dataset;
  id: string;
  name?: string;
  icon?: string;
}

export type LLMNodeDataSkill =
  | LLMNodeDataPluginSkill
  | LLMNodeDataWorkflowSkill
  | LLMNodeDataDatasetSkill;

export interface LLMNodeData extends CommonNodeData {
  skills: LLMNodeDataSkill[];
}

type BasicNodeDataMap = {
  [K in BasicStandardNodeTypes]: CommonNodeData;
};

export interface NodeData extends BasicNodeDataMap {
  [StandardNodeType.Api]: ApiNodeData;
  [StandardNodeType.SubWorkflow]: SubWorkflowNodeData;
  [StandardNodeType.Question]: QuestionNodeData;
  [StandardNodeType.LLM]: LLMNodeData;
}

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type EditAbleProperties<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];

export type EditAbleNodeData<T extends keyof NodeData> = Pick<
  NodeData[T],
  EditAbleProperties<NodeData[T]>
>;
