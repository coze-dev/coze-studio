import { get } from 'lodash-es';
import { type InputValueVO } from '@coze-workflow/base';

import { LoopPath } from '../../constants';

export const getLoopOutputNames = ({ value, formValues }): string[] => {
  const loopOutputs: InputValueVO[] =
    get(formValues, LoopPath.LoopOutputs) ?? [];
  return loopOutputs.map(input => input.name).filter(Boolean) as string[];
};
