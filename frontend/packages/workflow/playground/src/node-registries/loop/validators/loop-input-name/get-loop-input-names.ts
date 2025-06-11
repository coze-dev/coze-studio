import { get } from 'lodash-es';
import { type InputValueVO } from '@coze-workflow/base';

import { LoopPath } from '../../constants';

export const getLoopInputNames = ({ value, formValues }): string[] => {
  const loopArray: InputValueVO[] = get(formValues, LoopPath.LoopArray) ?? [];
  const loopVariables = get(formValues, LoopPath.LoopVariables) ?? [];
  const loopInputs = [...loopArray, ...loopVariables];
  return loopInputs.map(input => input.name).filter(Boolean) as string[];
};
