import { I18n } from '@coze-arch/i18n';

import { ColumnTitles } from '@/form';

export function SelectAndSetFieldsColumnsTitle() {
  return (
    <ColumnTitles
      columns={[
        {
          label: I18n.t('workflow_detail_node_parameter_name'),
          style: { width: 148 },
        },
        { label: I18n.t('workflow_detail_end_output_value') },
      ]}
    />
  );
}
