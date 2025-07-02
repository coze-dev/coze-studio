/* eslint-disable  @typescript-eslint/naming-convention*/
export const LoopFunctionIDPrefix = 'LoopFunction_';
export const getLoopFunctionID = (loopID: string) =>
  LoopFunctionIDPrefix + loopID;
export const getLoopID = (loopFunctionID: string) =>
  loopFunctionID.replace(LoopFunctionIDPrefix, '');
