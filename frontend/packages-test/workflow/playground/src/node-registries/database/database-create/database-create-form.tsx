import { useResetSelectAndSetFields } from '@/node-registries/database/common/hooks';
import {
  SelectAndSetFieldsField,
  DatabaseSelectField,
  OutputsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  createSelectAndSetFieldsFieldName,
  databaseSelectFieldName,
} from '@/constants/database-field-names';

export const DatabaseCreateForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetSelectAndSetFields = useResetSelectAndSetFields(
    createSelectAndSetFieldsFieldName,
  );

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetSelectAndSetFields();
        }}
      />
      {currentDatabase ? (
        <SelectAndSetFieldsField
          name={createSelectAndSetFieldsFieldName}
          shouldDisableRemove={field => field?.required ?? false}
        />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
