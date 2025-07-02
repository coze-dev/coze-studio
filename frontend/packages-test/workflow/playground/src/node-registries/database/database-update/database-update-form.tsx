import { I18n } from '@coze-arch/i18n';

import { useResetCondition } from '@/node-registries/database/common/hooks';
import {
  ConditionField,
  DatabaseSelectField,
  OutputsField,
  SelectAndSetFieldsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  updateConditionFieldName,
  updateSelectAndSetFieldsFieldName,
} from '@/constants/database-field-names';

import { useResetSelectAndSetFields } from './use-reset-select-and-set-fields';

export const DatabaseUpdateForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetCondition = useResetCondition(updateConditionFieldName);
  const resetSelectAndSetFields = useResetSelectAndSetFields();

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetCondition();
          resetSelectAndSetFields();
        }}
      />
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_update_condition_title')}
          name={updateConditionFieldName}
          min={1}
        />
      ) : null}
      {currentDatabase ? (
        <SelectAndSetFieldsField name={updateSelectAndSetFieldsFieldName} />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
