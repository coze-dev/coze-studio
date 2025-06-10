import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import { ViewVariableType } from '@coze-workflow/nodes';
import { type InputValueDTO, type InputValueVO } from '@coze-workflow/base';

import { ModeValue } from './constants';

export function transformOnInit(value, context) {
  const { playgroundContext } = context;
  const { variableService } = playgroundContext;
  const { inputs = {}, outputs = [], nodeMeta } = value || {};

  const { mode = ModeValue.Set, inputParameters = [] } = inputs;

  // 处理输入参数
  const formattedInputParameters: InputValueVO[] = [];
  inputParameters.forEach(input => {
    if (!input) {
      return;
    }
    formattedInputParameters.push(
      variableUtils.inputValueToVO(input, variableService),
    );
  });

  const isSetMode = mode === ModeValue.Set;

  // 处理输出参数
  const formattedOutputs =
    outputs.length > 0
      ? outputs
      : [
          {
            key: nanoid(),
            name: isSetMode ? 'isSuccess' : '',
            type: isSetMode
              ? ViewVariableType.Boolean
              : ViewVariableType.String,
          },
        ];

  return {
    nodeMeta,
    mode,
    inputParameters: formattedInputParameters,
    outputs: formattedOutputs,
  };
}

export function transformOnSubmit(value, context) {
  const { playgroundContext, node } = context;
  const { variableService } = playgroundContext;

  const { nodeMeta, mode, inputParameters, outputs } = value;

  // 处理输入参数
  const formattedInputParameters: InputValueDTO[] = [];
  inputParameters.forEach(input => {
    if (!input) {
      return;
    }
    const inputValue = variableUtils.inputValueToDTO(input, variableService, {
      node,
    }) as InputValueDTO;
    formattedInputParameters.push(inputValue);
  });

  return {
    nodeMeta,
    inputs: {
      mode,
      inputParameters: formattedInputParameters,
    },
    outputs,
  };
}
