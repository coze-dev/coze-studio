import { nanoid } from 'nanoid';
import { cloneDeep, set } from 'lodash-es';
import {
  type ViewVariableMeta,
  type ViewVariableType,
} from '@coze-workflow/base';

import { SelectFieldsButton } from '@/node-registries/database/common/components';
import { useCurrentDatabaseQuery } from '@/hooks';
import { useFieldArray, useForm } from '@/form';

import { type QueryFieldSchema } from './types';

interface QueryFieldsAddButtonProps {
  afterAppend?: () => void;
}

export function QueryFieldsAddButton({
  afterAppend,
}: QueryFieldsAddButtonProps) {
  const { value, append, readonly } = useFieldArray<QueryFieldSchema>();
  const selectedFieldIDs = value?.map(({ fieldID }) => fieldID);
  const form = useForm();

  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const outputs = form.getValueIn<ViewVariableMeta[]>('outputs');

  return (
    <SelectFieldsButton
      onSelect={id => {
        append({ fieldID: id, isDistinct: false });
        const field = currentDatabase?.fields?.find(item => item.id === id);
        const outputListField = cloneDeep(outputs)?.find(
          item => item.name === 'outputList',
        ) as ViewVariableMeta;
        const rowNumField = outputs?.find(item => item.name === 'rowNum');
        const curIdField = outputListField?.children?.find(
          item => item.name === field?.name,
        );
        if (!curIdField) {
          if (!Array.isArray(outputListField?.children)) {
            set(outputListField, 'children', []);
          }
          outputListField?.children?.push({
            key: nanoid(),
            name: field?.name ?? '',
            type: field?.type as ViewVariableType,
          });
          form.setValueIn('outputs', [outputListField, rowNumField]);
        }
        afterAppend?.();
      }}
      selectedFieldIDs={selectedFieldIDs}
      fields={currentDatabase?.fields}
      filterSystemFields={false}
      readonly={readonly}
    />
  );
}
