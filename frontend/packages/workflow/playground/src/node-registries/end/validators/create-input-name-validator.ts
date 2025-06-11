import { get } from 'lodash-es';
import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';

export const createInputNameValidator = (): Validate<string> => {
  const baseValidator = createNodeInputNameValidate({
    getNames: ({ formValues }) =>
      (get(formValues, 'inputParameters') || []).map(item => item.name),
  });
  return params => {
    if (!params.value) {
      return '';
    }
    return baseValidator(params);
  };
};
