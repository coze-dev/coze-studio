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

import { get, isString, omit } from 'lodash-es';
import JSONBig from 'json-bigint';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeData,
  LLMNodeDataSkillType,
  type LLMNodeDataSkill,
  type LLMNodeDataDatasetSkill,
  type LLMNodeDataPluginSkill,
  type LLMNodeDataWorkflowSkill,
} from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base/types';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';

import { type FunctionCallLog, type FunctionCallLogItem } from '../types';
import { LogType } from '../constants';

interface FunctionCallDetailItem {
  input: string;
  output: string;
}

interface FunctionCallDetailInput {
  name?: string;
  arguments?: Record<string, unknown>;
  plugin_id?: number;
  plugin_name?: string;
  api_id?: number;
  api_name?: string;
  plugin_type?: number;
}

interface FunctionCallKnowledgeOutput {
  chunks: {
    slice: string;
    score: number;
    meta: {
      dataset: {
        id: string;
        name: string;
      };
    };
  }[];
}

interface FunctionCallDetailOutput {
  [key: string]: unknown;
}

export interface FunctionCallDetail {
  fc_called_list: FunctionCallDetailItem[];
}

function getNodeSkills(node?: FlowNodeEntity): LLMNodeDataSkill[] {
  const nodeData = node?.getData(WorkflowNodeData);

  if (!nodeData) {
    return [];
  }

  return nodeData.getNodeData<StandardNodeType.LLM>()?.skills || [];
}

function getPluginLogItem(
  input: FunctionCallDetailInput,
  output: FunctionCallDetailOutput | string,
  skills: LLMNodeDataSkill[],
): FunctionCallLogItem {
  const nodeSkill = skills.find(
    skill =>
      skill.type === LLMNodeDataSkillType.Plugin &&
      `${skill.apiId}` === `${input.api_id}`,
  ) as LLMNodeDataPluginSkill;

  const pluginName = nodeSkill?.pluginName || input.plugin_name || '';
  const apiName = input.api_name;

  const logItem: FunctionCallLogItem = {
    name: `${pluginName} - ${apiName}`,
    inputs: input.arguments || {},
    outputs: output || {},
    icon: nodeSkill?.icon || '',
  };
  return logItem;
}

function getWorkflowLogItem(
  input: FunctionCallDetailInput,
  output: FunctionCallDetailOutput | string,
  skills: LLMNodeDataSkill[],
): FunctionCallLogItem {
  const nodeSkill = skills.find(
    skill =>
      skill.type === LLMNodeDataSkillType.Workflow &&
      `${skill.pluginId}` === `${input.plugin_id}`,
  ) as LLMNodeDataWorkflowSkill;

  const logItem: FunctionCallLogItem = {
    name: nodeSkill?.name || '',
    inputs: input?.arguments || {},
    outputs: isString(output)
      ? output
      : (output as Record<string, unknown>) || {},
    icon: nodeSkill?.icon || '',
  };
  return logItem;
}

function getDatasetLogItem(
  output: FunctionCallKnowledgeOutput,
  skills: LLMNodeDataSkill[],
): FunctionCallLogItem | null {
  const chunk = get(output, 'chunks[0]');
  if (!chunk) {
    return null;
  }

  const oriReq = get(output, 'ori_req');
  let inputs;

  if (oriReq) {
    try {
      inputs = JSON.parse(oriReq);
    } catch (error) {
      logger.error(error);
    }
  }

  const id = get(chunk, 'meta.dataset.id');

  const nodeSkill = skills.find(
    skill =>
      skill.type === LLMNodeDataSkillType.Dataset && `${skill.id}` === `${id}`,
  ) as LLMNodeDataDatasetSkill;

  const name = nodeSkill?.name || get(chunk, 'dataset.name') || '';

  const logItem: FunctionCallLogItem = {
    name,
    outputs: omit(chunk, 'meta'),
    inputs,
    icon: nodeSkill?.icon || '',
  };
  return logItem;
}

function parseOutput(
  jsonBig: JSONBig,
  output: string,
): FunctionCallDetailOutput | string {
  try {
    return jsonBig.parse(output) as FunctionCallDetailOutput;
    // eslint-disable-next-line @coze-arch/no-empty-catch, @coze-arch/use-error-in-catch, no-empty
  } catch (e) {}
  return output;
}

export function parseFunctionCall(
  fcCalledDetail: FunctionCallDetail,
  node?: FlowNodeEntity,
): FunctionCallLog {
  let items: FunctionCallLogItem[] = [];
  const jsonBig = JSONBig({ storeAsString: true });

  items = (fcCalledDetail?.fc_called_list || [])
    .map(detailItem => {
      try {
        const input = detailItem.input
          ? (jsonBig.parse(detailItem.input) as FunctionCallDetailInput)
          : {};
        const output = detailItem.output
          ? (parseOutput(jsonBig, detailItem.output) as
              | FunctionCallDetailOutput
              | string)
          : {};

        const type = get(output, 'msg_type');
        const skills = getNodeSkills(node);

        // Knowledge base type
        if (type === 'knowledge_recall') {
          const data: FunctionCallKnowledgeOutput = JSON.parse(
            get(output, 'data', '{}') as string,
          );
          return getDatasetLogItem(data, skills);
        }

        // plugin type
        if (input?.plugin_type === LLMNodeDataSkillType.Plugin) {
          return getPluginLogItem(input, output, skills);
        }

        // Workflow Type
        if (input?.plugin_type === LLMNodeDataSkillType.Workflow) {
          return getWorkflowLogItem(input, output, skills);
        }
      } catch (e) {
        logger.error(e);
      }
      return null;
    })
    .filter(Boolean) as FunctionCallLogItem[];

  return {
    type: LogType.FunctionCall,
    items,
    data: items,
    copyTooltip: I18n.t('workflow_250310_13', undefined, '复制'),
  };
}
