import { I18n } from '@coze-arch/i18n';

import { queryConditionFieldName } from '@/constants/database-field-names';

import { Database } from '../database-content/database';
import { Outputs, DatabaseCondition } from '../../fields';

export function DatabaseQueryContent() {
  return (
    <>
      <Outputs />
      <Database />
      <DatabaseCondition
        label={I18n.t('workflow_query_condition_title')}
        name={queryConditionFieldName}
      />
    </>
  );
}
