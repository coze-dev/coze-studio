import { get } from 'lodash-es';
import { type InputValueVO } from '@coze-workflow/base';

import { BatchPath } from '../../constants';

export const getBatchOutputNames = ({ value, formValues }): string[] => {
  const batchOutputs: InputValueVO[] = get(formValues, BatchPath.Outputs) ?? [];
  return batchOutputs.map(input => input.name).filter(Boolean) as string[];
};
