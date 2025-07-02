/* eslint-disable  @typescript-eslint/naming-convention*/
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { getLoopOutputNames } from './get-loop-output-names';

export const LoopOutputNameValidator = createNodeInputNameValidate({
  getNames: getLoopOutputNames,
});
