import { type DatabaseSettingField } from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';
import { useFieldArray } from '@/form';

import { SelectFieldsButton } from '../../components';

export function SelectAndSetFieldsAddButton({
  afterAppend,
}: {
  afterAppend?: () => void;
}) {
  const { value, append, readonly } = useFieldArray<DatabaseSettingField>();
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);

  return (
    <SelectFieldsButton
      readonly={readonly}
      selectedFieldIDs={selectedFieldIDs}
      onSelect={id => {
        append({ fieldID: id });
        afterAppend?.();
      }}
      fields={currentDatabase?.fields?.filter(
        ({ isSystemField }) => !isSystemField,
      )}
    />
  );
}
