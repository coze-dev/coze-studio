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

import { type DatabaseField } from '@coze-workflow/base';

import { withFieldArray, type FieldProps } from '@/form';

import { SelectAndSetFieldsFieldContext } from './select-and-set-fields-context';
import { SelectAndSetFields } from './select-and-set-fields';
interface SelectAndSetFieldsFieldProps extends Pick<FieldProps, 'name'> {
  shouldDisableRemove?: (field?: DatabaseField) => boolean;
}

export const SelectAndSetFieldsField = withFieldArray<
  SelectAndSetFieldsFieldProps,
  DatabaseField
>(({ shouldDisableRemove = () => false }) => (
  <SelectAndSetFieldsFieldContext.Provider
    value={{
      shouldDisableRemove,
    }}
  >
    <SelectAndSetFields />
  </SelectAndSetFieldsFieldContext.Provider>
));
