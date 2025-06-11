import { I18n } from '@coze-arch/i18n';

import { useResetCondition } from '@/node-registries/database/common/hooks';
import {
  DatabaseSelectField,
  OutputsField,
  ConditionField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  deleteConditionFieldName,
} from '@/constants/database-field-names';

export const DatabaseDeleteForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetCondition = useResetCondition(deleteConditionFieldName);

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetCondition();
        }}
      />
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_delete_conditon_title')}
          name={deleteConditionFieldName}
          min={1}
        />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
