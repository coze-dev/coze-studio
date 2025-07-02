import { type FormItemSchema } from '../../types';
import {
  TestsetFormValuesForBoolSelect,
  FormItemSchemaType,
} from '../../constants';

export function transTestsetBoolSelect2Bool(
  val?: TestsetFormValuesForBoolSelect,
) {
  switch (val) {
    case TestsetFormValuesForBoolSelect.TRUE:
      return true;
    case TestsetFormValuesForBoolSelect.FALSE:
      return false;
    default:
      return undefined;
  }
}

export function transTestsetBool2BoolSelect(val?: boolean) {
  switch (val) {
    case true:
      return TestsetFormValuesForBoolSelect.TRUE;
    case false:
      return TestsetFormValuesForBoolSelect.FALSE;
    default:
      return undefined;
  }
}

export function transTestsetFormItemSchema2Form(ipt?: FormItemSchema) {
  if (ipt?.type === FormItemSchemaType.BOOLEAN) {
    return {
      ...ipt,
      value: transTestsetBool2BoolSelect(ipt.value as boolean | undefined),
    };
  }

  return ipt;
}
