import { SelectFieldsButton } from '@/node-registries/database/common/components';
import { useFieldArray } from '@/form';

import { useQueryFields } from './use-query-fields';
import { type OrderByFieldSchema } from './types';
interface OrderByAddButtonProps {
  afterAppend?: () => void;
}

export function OrderByAddButton({ afterAppend }: OrderByAddButtonProps) {
  const queryFields = useQueryFields();
  const { value, append, readonly } = useFieldArray<OrderByFieldSchema>();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);

  return (
    <SelectFieldsButton
      onSelect={id => {
        append({ fieldID: id, isAsc: true });
        afterAppend?.();
      }}
      selectedFieldIDs={selectedFieldIDs}
      fields={queryFields}
      filterSystemFields={false}
      readonly={readonly}
    />
  );
}
