import { I18n } from '@coze-arch/i18n';

import { ColumnTitles } from '@/form';

export function QueryFieldsColumnTitles() {
  return (
    <ColumnTitles
      columns={[
        {
          label: I18n.t('workflow_query_fields_name', {}, '字段名'),
          style: {
            width: 249,
          },
        },
        // {
        //   label: I18n.t('workflow_query_fields_remove_duplicates', {}, '去重'),
        // },
      ]}
    />
  );
}
