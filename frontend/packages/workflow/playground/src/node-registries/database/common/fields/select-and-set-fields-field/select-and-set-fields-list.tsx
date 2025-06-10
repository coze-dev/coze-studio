import { type DatabaseSettingField } from '@coze-workflow/base';

import { FieldArrayList, useFieldArray } from '@/form';

import { SelectAndSetFieldsItem } from './select-and-set-fields-item';

export function SelectAndSetFieldsList() {
  const { value } = useFieldArray<DatabaseSettingField>();

  return (
    <FieldArrayList>
      {value?.map(({ fieldID }, index) => (
        <SelectAndSetFieldsItem key={fieldID} index={index} />
      ))}
    </FieldArrayList>
  );
}
