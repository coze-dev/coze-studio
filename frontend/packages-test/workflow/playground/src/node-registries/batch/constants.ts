/* eslint-disable  @typescript-eslint/naming-convention*/
/* eslint-disable @typescript-eslint/no-shadow */

export const BatchSize = {
  width: 360,
  height: 139.86,
};

export const BatchFunctionSize = {
  width: BatchSize.width,
  height: (BatchSize.width * 3) / 5,
};

export const BatchOutputsSuffix = '_list';

export enum BatchPath {
  ConcurrentSize = 'inputs.concurrentSize',
  BatchSize = 'inputs.batchSize',
  Inputs = 'inputs.inputParameters',
  Outputs = 'outputs',
}
