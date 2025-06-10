import { I18n } from '@coze-arch/i18n';

import {
  updateConditionFieldName,
  updateSelectAndSetFieldsFieldName,
} from '@/constants/database-field-names';

import { Database } from '../database-content/database';
import { DatabaseCondition } from '../../fields/database-condition';
import { Outputs, DatabaseSettingFields } from '../../fields';

export function DatabaseUpdateContent() {
  return (
    <>
      <Outputs />
      <Database />
      <DatabaseCondition
        label={I18n.t('workflow_update_condition_title')}
        name={updateConditionFieldName}
      />
      <DatabaseSettingFields
        label={I18n.t('workflow_update_fields')}
        name={updateSelectAndSetFieldsFieldName}
      />
    </>
  );
}
