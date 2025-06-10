import { type DatabaseCondition } from '@coze-workflow/base';

import { useFieldArray, FieldArrayList } from '@/form';

import { ConditionItemField } from './condition-item-field';

interface ConditionListProps {
  min?: number;
}

export function ConditionList({ min }: ConditionListProps) {
  const { name, value, remove, readonly } = useFieldArray<DatabaseCondition>();

  return (
    <FieldArrayList>
      {value?.map((_, index) => (
        <ConditionItemField
          name={`${name}.[${index}]`}
          disableRemove={
            readonly || (min !== undefined ? value?.length <= min : false)
          }
          onClickRemove={() => {
            remove(index);
          }}
          hasFeedback={false}
        />
      ))}
    </FieldArrayList>
  );
}
