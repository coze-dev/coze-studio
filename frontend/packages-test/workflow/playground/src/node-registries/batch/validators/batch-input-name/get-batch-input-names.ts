import { get } from 'lodash-es';
import { type InputValueVO } from '@coze-workflow/base';

import { BatchPath } from '../../constants';

export const getBatchInputNames = ({ value, formValues }): string[] => {
  const batchInputs: InputValueVO[] = get(formValues, BatchPath.Inputs) ?? [];
  return batchInputs.map(input => input.name).filter(Boolean) as string[];
};
