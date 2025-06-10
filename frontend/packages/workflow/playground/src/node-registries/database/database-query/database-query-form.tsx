import { I18n } from '@coze-arch/i18n';

import {
  DatabaseSelectField,
  ConditionField,
  OutputsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  queryFieldsFieldName,
  queryConditionFieldName,
  orderByFieldName,
  queryLimitFieldName,
} from '@/constants/database-field-names';

import { useResetFields } from './use-reset-fields';
import { QueryLimitField } from './query-limit-field';
import { QueryFieldsField } from './query-fields-field';
import { OrderByField } from './order-by-field';

export const DatabaseQueryForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetFields = useResetFields();

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={resetFields}
      />
      {currentDatabase ? (
        <QueryFieldsField name={queryFieldsFieldName} />
      ) : null}
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_query_condition_title')}
          name={queryConditionFieldName}
        />
      ) : null}
      {currentDatabase ? <OrderByField name={orderByFieldName} /> : null}
      {currentDatabase ? <QueryLimitField name={queryLimitFieldName} /> : null}
      <OutputsField deps={[queryFieldsFieldName]} name="outputs" />
    </>
  );
});
