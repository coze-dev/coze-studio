import { I18n } from '@coze-arch/i18n';

import { deleteConditionFieldName } from '@/constants/database-field-names';

import { Database } from '../database-content/database';
import { Outputs, DatabaseCondition } from '../../fields';

export function DatabaseDeleteContent() {
  return (
    <>
      <Outputs />
      <Database />
      <DatabaseCondition
        label={I18n.t('workflow_delete_conditon_title')}
        name={deleteConditionFieldName}
      />
    </>
  );
}
