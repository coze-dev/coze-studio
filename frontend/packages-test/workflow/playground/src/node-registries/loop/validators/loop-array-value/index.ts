/* eslint-disable  @typescript-eslint/naming-convention*/
import { get } from 'lodash-es';
import { type Validate } from '@flowgram-adapter/free-layout-editor';
import { type ValueExpression } from '@coze-workflow/base';

import { LoopInputValueValidator } from '../loop-input-value';
import { LoopPath, LoopType } from '../../constants';

export const LoopArrayValueValidator: Validate<ValueExpression> = params => {
  const { formValues } = params;
  const loopType = get(formValues, LoopPath.LoopType);
  if (loopType !== LoopType.Array) {
    return;
  }
  return LoopInputValueValidator(params);
};
