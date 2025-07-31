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

import { camelCase } from 'lodash-es';
import type {
  ILibraryItem,
  LibraryType,
} from '@coze-common/editor-plugins/library-insert';
import { DEFAULT_MODEL_TYPE } from '@coze-workflow/nodes';
import {
  BlockInput,
  GenerationDiversity,
  VariableTypeDTO,
  type InputValueDTO,
} from '@coze-workflow/base';
import { ModelParamType, type Model } from '@coze-arch/bot-api/developer_api';

import { isDraftByProjectId } from '@/nodes-v2/llm/skills/utils';

import {
  type BoundKnowledgeItem,
  type BoundPluginItem,
  type BoundSkills,
  type BoundWorkflowItem,
  SkillType,
} from './skills/types';
import { defaultKnowledgeGlobalSetting } from './skills/constants';

const getDefaultModels = (modelMeta: Model): InputValueDTO[] => {
  const defaultModel: InputValueDTO[] = [];

  modelMeta?.model_params?.forEach(p => {
    const k = camelCase(p.name) as string;
    const { type } = p;
    // Priority to take the balance, custom bottom line
    const defaultValue =
      p.default_val[GenerationDiversity.Balance] ??
      p.default_val[GenerationDiversity.Customize];

    if (defaultValue !== undefined) {
      if (ModelParamType.Float === type) {
        defaultModel.push(BlockInput.createFloat(k, defaultValue));
      } else if (ModelParamType.Int === type || ['modelType'].includes(k)) {
        defaultModel.push(BlockInput.createInteger(k, defaultValue));
      }
    }
  });

  return defaultModel;
};

export const getDefaultLLMParams = (models: Model[]) => {
  const modelMeta =
    models.find(m => m.model_type === DEFAULT_MODEL_TYPE) ?? models[0];

  const llmParam = [
    BlockInput.createInteger('modelType', `${modelMeta?.model_type ?? ''}`),
    BlockInput.createString('modelName', modelMeta?.name ?? ''),
    BlockInput.createString('generationDiversity', GenerationDiversity.Balance),
    ...getDefaultModels(modelMeta),
  ].filter(Boolean);

  return llmParam;
};

export const reviseLLMParamPair = (d: InputValueDTO): [string, unknown] => {
  let k = d?.name || '';

  // The TODO front end does not rely on this field. After confirming that the back end does not rely on it, it can be deleted.
  // Compatible with a long-standing spelling error
  if (k === 'modleName') {
    k = 'modelName';
  }
  let v = d.input.value.content;
  if (
    [VariableTypeDTO.float, VariableTypeDTO.integer].includes(
      d.input.type as VariableTypeDTO,
    )
  ) {
    v = Number(d.input.value.content);
  }

  return [k, v];
};

export const modelItemToBlockInput = (
  model: Model,
  modelMeta: Model | undefined,
): BlockInput[] =>
  Object.keys(model).map(k => {
    const type = modelMeta?.model_params?.find(
      p => camelCase(p.name) === k,
    )?.type;
    if (ModelParamType.Float === type) {
      return BlockInput.createFloat(k, model[k]);
    } else if (ModelParamType.Int === type || ['modelType'].includes(k)) {
      return BlockInput.createInteger(k, model[k]);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    let _k = k;
    // The TODO front end does not rely on this field. After confirming that the back end does not rely on it, it can be deleted.
    if (_k === 'modelName') {
      _k = 'modleName';
    }
    return BlockInput.createString(_k, model[k]);
  });

const libraryType2SkillsType = (type: LibraryType): SkillType => {
  if (type === 'plugin') {
    return SkillType.Plugin;
  }

  if (type === 'imageflow' || type === 'workflow') {
    return SkillType.Workflow;
  }

  return SkillType.Knowledge;
};

export const addSKillFromLibrary = (
  library: ILibraryItem,
  _skills: BoundSkills,
): BoundSkills => {
  const type = libraryType2SkillsType(library.type);
  const skills: BoundSkills = _skills || {};

  if (type === SkillType.Plugin) {
    const data = skills.pluginFCParam?.pluginList || [];
    const detail = library.detail_info?.plugin_detail;
    data.push({
      plugin_id: detail?.plugin_id as string,
      api_id: detail?.api_id as string,
      api_name: detail?.name as string,
      plugin_version: '', // And @Zhang Yousong, confirm, do not send the version
      is_draft: isDraftByProjectId(detail?.project_id),
    });

    return {
      ...skills,
      pluginFCParam: {
        pluginList: data as Array<BoundPluginItem>,
      },
    };
  } else if (type === SkillType.Workflow) {
    const data = skills.workflowFCParam?.workflowList || [];
    const detail = library.detail_info?.workflow_detail;
    data.push({
      plugin_id: detail?.plugin_id as string,
      workflow_id: detail?.workflow_id as string,
      plugin_version: '',
      workflow_version: '', // And @Zhang Yousong, confirm, do not send the version
      is_draft: isDraftByProjectId(detail?.project_id),
    });

    return {
      ...skills,
      workflowFCParam: {
        workflowList: data as Array<BoundWorkflowItem>,
      },
    };
  } else if (type === SkillType.Knowledge) {
    const data = skills.knowledgeFCParam?.knowledgeList || [];
    const detail = library.detail_info?.knowledge_detail;

    data.push({
      id: detail?.id as string,
      name: detail?.name as string,
    });

    return {
      ...skills,
      knowledgeFCParam: {
        ...skills.knowledgeFCParam,
        knowledgeList: data as Array<BoundKnowledgeItem>,
        global_setting:
          skills.knowledgeFCParam?.global_setting ??
          defaultKnowledgeGlobalSetting,
      },
    };
  }

  return skills;
};
