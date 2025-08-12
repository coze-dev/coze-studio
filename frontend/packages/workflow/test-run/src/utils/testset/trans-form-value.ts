/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
