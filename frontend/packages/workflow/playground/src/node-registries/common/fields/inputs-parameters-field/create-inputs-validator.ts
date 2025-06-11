import { get } from 'lodash-es';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';

import { createInputTreeValidator } from '../../validators/create-input-tree-validator';

export function createInputsValidator(isTree: boolean): {
  [key: string]: Validate;
} {
  if (isTree) {
    return {
      'inputs.inputParameters': createInputTreeValidator(),
    };
  }

  return {
    'inputs.inputParameters.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputs.inputParameters') || []).map(
          item => item.name,
        ),
    }),
    'inputs.inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
  };
}
