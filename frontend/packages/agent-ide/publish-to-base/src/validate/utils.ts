import { InputComponentType } from '@coze-arch/bot-api/connector_api';

import { type BaseOutputStructLineType } from '../types';

const OUTPUT_TYPE_STRUCT = 25;
export const OUTPUT_TYPE_TEXT = 1;
const OUTPUT_TYPE_NUMBER = 2;

export const getIsStructOutput = (id: number): boolean =>
  id === OUTPUT_TYPE_STRUCT;

export const getIsTextOutput = (id: number | undefined): boolean =>
  id === OUTPUT_TYPE_TEXT;

export const getIsNumberOutput = (id: number | undefined): boolean =>
  id === OUTPUT_TYPE_NUMBER;

export const getIsSelectType = (type: InputComponentType) =>
  [InputComponentType.SingleSelect, InputComponentType.MultiSelect].includes(
    type,
  );

export const verifyOutputStructFieldAsGroupByKey = (
  field: BaseOutputStructLineType,
) => getIsTextOutput(field.output_type);

export const verifyOutputStructFieldAsPrimaryKey = (
  field: BaseOutputStructLineType,
) => {
  const outputType = field.output_type;
  return getIsTextOutput(outputType) || getIsNumberOutput(outputType);
};
