import { type DatabaseCondition } from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';
import { useField } from '@/form';

export function useConditionLeftDataType() {
  const { value } = useField<DatabaseCondition>();
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const field = currentDatabase?.fields?.find(
    item => item.name === value?.left,
  );
  return field?.type;
}
