/* eslint-disable  @typescript-eslint/naming-convention*/
export const LoopSize = {
  width: 360,
  height: 139.86,
};

export const LoopFunctionSize = {
  width: LoopSize.width,
  height: (LoopSize.width * 3) / 5,
};

export const LoopVariablePrefix = 'var_';
export const LoopOutputsSuffix = '_list';

export enum LoopPath {
  LoopType = 'inputs.loopType',
  LoopCount = 'inputs.loopCount',
  LoopArray = 'inputs.inputParameters',
  LoopVariables = 'inputs.variableParameters',
  LoopOutputs = 'outputs',
}

export enum LoopType {
  Array = 'array',
  Count = 'count',
  Infinite = 'infinite',
}
