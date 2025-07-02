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
 * fc参数后端转前端
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
 * fc参数前端转后端
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
