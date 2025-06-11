import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { SET_VARIABLE_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const SET_VARIABLE_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.SetVariable,
  meta: {
    hideTest: true,
    nodeDTOType: StandardNodeType.SetVariable,
    size: { width: 360, height: 87.86 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: INPUT_PATH, // 入参路径，试运行等功能依赖该路径提取参数
  },
  variablesMeta: {
    outputsPathList: [],
    inputsPathList: [],
  },
  formMeta: SET_VARIABLE_FORM_META,
};
