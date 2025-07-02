/* eslint-disable  @typescript-eslint/naming-convention*/
export const BatchFunctionIDPrefix = 'BatchFunction_';
export const getBatchFunctionID = (batchID: string) =>
  BatchFunctionIDPrefix + batchID;
export const getBatchID = (batchFunctionID: string) =>
  batchFunctionID.replace(BatchFunctionIDPrefix, '');
