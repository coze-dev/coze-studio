import { type WorkflowDatabase } from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';
import { type Library } from '@/form-extensions/components/library-select';

function databaseToLibrary(databaseInfo: WorkflowDatabase, error): Library {
  const {
    id = '',
    tableDesc: description,
    tableName: name,
    iconUrl: iconUrl,
  } = databaseInfo;
  return {
    id,
    name,
    description,
    iconUrl,
    isInvalid: !!error,
  };
}

export function useLibraries() {
  const { data, error } = useCurrentDatabaseQuery();
  const libraries: Library[] = data
    ? [databaseToLibrary((data ?? {}) as WorkflowDatabase, error)]
    : [];

  return libraries;
}
