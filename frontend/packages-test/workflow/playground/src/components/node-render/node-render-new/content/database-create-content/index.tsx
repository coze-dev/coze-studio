import { I18n } from '@coze-arch/i18n';

import { createSelectAndSetFieldsFieldName } from '@/constants/database-field-names';

import { Database } from '../database-content/database';
import { Outputs, DatabaseSettingFields } from '../../fields';

export function DatabaseCreateContent() {
  return (
    <>
      <Outputs />
      <Database />
      <DatabaseSettingFields
        label={I18n.t('workflow_setting_fields')}
        name={createSelectAndSetFieldsFieldName}
      />
    </>
  );
}
