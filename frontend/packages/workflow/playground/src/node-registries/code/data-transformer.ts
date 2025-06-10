import { type NodeContext } from '@flowgram-adapter/free-layout-editor';
import { type NodeDataDTO } from '@coze-workflow/base';

import { getDefaultValue } from '@/form-extensions/setters/code/defaults';

import { type FormData } from './types';
import { DEFAULT_INPUTS, DEFAULT_OUTPUTS } from './constants';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (
  value: NodeDataDTO | undefined,
  context: NodeContext,
) => {
  const { globalState } = context.playgroundContext;
  const { isBindDouyin } = globalState;
  const defaultCodeParams = getDefaultValue({ isBindDouyin });
  // 初始值设置
  const initValue = value || {
    inputs: {
      inputParameters: DEFAULT_INPUTS,
      ...defaultCodeParams,
    },
    outputs: DEFAULT_OUTPUTS,
  };

  const { inputs = {}, ...others } = initValue;
  return {
    ...others,
    inputParameters: inputs.inputParameters,
    codeParams: {
      code: inputs.code,
      language: inputs.language,
    },
    nodeMeta: value?.nodeMeta,
  };
};

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData) => ({
  nodeMeta: value.nodeMeta,
  inputs: {
    inputParameters: value.inputParameters,
    ...value.codeParams,
  },
  outputs: value.outputs,
});
