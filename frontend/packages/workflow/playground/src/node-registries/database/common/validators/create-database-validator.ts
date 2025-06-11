import { I18n } from '@coze-arch/i18n';

import { databaseSelectFieldName } from '@/constants/database-field-names';

export const createDatabaseValidator = () => ({
  [databaseSelectFieldName]: ({ value }) => {
    if (!value || value.length === 0) {
      return I18n.t('workflow_detail_node_error_empty');
    }
  },
});
