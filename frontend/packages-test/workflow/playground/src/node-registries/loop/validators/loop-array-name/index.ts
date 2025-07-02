/* eslint-disable  @typescript-eslint/naming-convention*/
import { type Validate } from '@flowgram-adapter/free-layout-editor';
import { get } from 'lodash-es';
import { LoopPath, LoopType } from '../../constants';
import { LoopInputNameValidator } from '../loop-input-name';

export const LoopArrayNameValidator: Validate<string> = params => {
  const { formValues } = params;
  const loopType = get(formValues, LoopPath.LoopType);
  if (loopType !== LoopType.Array) {
    return;
  }
  return LoopInputNameValidator(params);
};
