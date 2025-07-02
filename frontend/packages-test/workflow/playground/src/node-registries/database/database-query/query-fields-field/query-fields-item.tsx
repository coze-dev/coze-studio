import { useNodeTestId } from '@coze-workflow/base';

import { useCurrentDatabaseField } from '@/node-registries/database/common/hooks';
import { DataTypeTag } from '@/node-registries/common/components';
import { FieldArrayItem, Label, useFieldArray } from '@/form';

import { type QueryFieldSchema } from './types';

interface QueryFieldsItemProps {
  index: number;
}

export function QueryFieldsItem({ index }: QueryFieldsItemProps) {
  const { name, value, remove, readonly } = useFieldArray<QueryFieldSchema>();
  const databaseField = useCurrentDatabaseField(value?.[index].fieldID);
  const { getNodeSetterId } = useNodeTestId();

  return (
    <FieldArrayItem
      disableRemove={readonly}
      onRemove={() => remove(index)}
      removeTestId={`${getNodeSetterId(name)}.remove`}
    >
      <Label
        className="w-[249px]"
        extra={<DataTypeTag type={databaseField?.type}></DataTypeTag>}
      >
        <span className="max-w-[200px] truncate">{databaseField?.name}</span>
      </Label>
    </FieldArrayItem>
  );
}
