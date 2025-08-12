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
 * Data related to the API stored on the API node
 */
export type ApiNodeData = CommonNodeData &
  Readonly<
    Partial<ApiNodeDetailDTO> & {
      /**
       * The plug-in node in the project needs to save the projectId.
       */
      projectId?: string;
      /** The latest version of the plugin timestamp */
      latestVersionTs?: string;
      /** The display name of the latest version of the plugin, like v1.0.0 */
      latestVersionName?: string;
      /** The display name of the current version of the plugin, in the form of v1.0.0 */
      versionName?: string;
    }
  >;

/**
 * Related data stored on the subprocess node
 */
export type SubWorkflowNodeData = CommonNodeData &
  Readonly<Omit<ReleasedWorkflow, 'inputs' | 'outputs'>> & {
    /** Subprocess Node Input Definition */
    inputsDefinition: DTODefine.InputVariableDTO[];
    /**
     * The sub-process in the project needs to save the projectId.
     */
    projectId?: string;
    /** The latest version of the subprocess */
    latestVersion?: string;
  };

export type QuestionNodeData = CommonNodeData & {
  question: string;
  options: any;
  answerType: string;
};

/**
 * Related data for common node types
 * See Type BasicStandardNodeTypes for basic node definitions
 */
export interface CommonNodeData {
  /**
   *
   * Node icon
   */
  readonly icon: string;
  /**
   * node description
   */
  description: string;
  /**
   * Node title
   */
  title: string;
  /**
   * Node main color
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

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? A
  : B;

type EditAbleProperties<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}[keyof T];

export type EditAbleNodeData<T extends keyof NodeData> = Pick<
  NodeData[T],
  EditAbleProperties<NodeData[T]>
>;
