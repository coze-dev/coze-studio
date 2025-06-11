import { isNil } from 'lodash-es';

import { type FormItemSchema } from '../../types';
import { FormItemSchemaType } from '../../constants';

export function assignTestsetFormDefaultValue(ipt: FormItemSchema) {
  if (!isNil(ipt.value)) {
    return;
  }

  switch (ipt.type) {
    case FormItemSchemaType.BOOLEAN:
      // ipt.value = true;
      break;
    case FormItemSchemaType.OBJECT:
      ipt.value = '{}';
      break;
    case FormItemSchemaType.LIST:
      ipt.value = '[]';
      break;
    default:
      break;
  }
}
