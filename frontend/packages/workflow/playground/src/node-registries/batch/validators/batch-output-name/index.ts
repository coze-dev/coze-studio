/* eslint-disable  @typescript-eslint/naming-convention*/
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { getBatchOutputNames } from './get-batch-output-names';

export const BatchOutputNameValidator = createNodeInputNameValidate({
  getNames: getBatchOutputNames,
});
