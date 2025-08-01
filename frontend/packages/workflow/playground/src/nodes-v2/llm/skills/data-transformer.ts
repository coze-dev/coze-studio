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

import { get, isUndefined, set } from 'lodash-es';

import {
  type BoundKnowledgeItem,
  type BoundSkills,
  type KnowledgeGlobalSetting,
} from './types';

interface KnowledgeGlobalSettingDTO extends KnowledgeGlobalSetting {
  search_mode?: number;
}

interface FunctionCallParamDTO extends BoundSkills {
  knowledgeFCParam?: {
    knowledgeList?: Array<BoundKnowledgeItem>;
    global_setting?: KnowledgeGlobalSettingDTO;
  };
}

type FunctionCallParamVO = BoundSkills;

/**
 * FC parameter backend to frontend
 * @param fcParamDTO
 * @returns
 */
export function formatFcParamOnInit(fcParamDTO?: FunctionCallParamDTO) {
  if (!fcParamDTO) {
    return fcParamDTO;
  }
  const searchMode = get(
    fcParamDTO,
    'knowledgeFCParam.global_setting.search_mode',
  );

  if (isUndefined(searchMode)) {
    return fcParamDTO;
  }

  delete fcParamDTO?.knowledgeFCParam?.global_setting?.search_mode;
  set(
    fcParamDTO,
    'knowledgeFCParam.global_setting.search_strategy',
    searchMode,
  );

  return fcParamDTO;
}

/**
 * FC parameter front-end to back-end
 * @param fcParamVO
 * @returns
 */
export function formatFcParamOnSubmit(fcParamVO?: FunctionCallParamVO) {
  if (!fcParamVO) {
    return fcParamVO;
  }
  const searchStrategy = get(
    fcParamVO,
    'knowledgeFCParam.global_setting.search_strategy',
  );

  if (isUndefined(searchStrategy)) {
    return fcParamVO;
  }

  delete fcParamVO?.knowledgeFCParam?.global_setting?.search_strategy;
  set(fcParamVO, 'knowledgeFCParam.global_setting.search_mode', searchStrategy);

  return fcParamVO;
}
