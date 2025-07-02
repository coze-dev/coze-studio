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
