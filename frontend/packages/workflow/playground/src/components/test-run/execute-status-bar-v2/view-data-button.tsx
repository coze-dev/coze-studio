import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';

import { useOpenDatabaseDetail } from '@/components/database-detail-modal';

export function ViewDataButton() {
  const { openDatabaseDetail } = useOpenDatabaseDetail();

  return (
    <Button
      onClick={e => {
        e.stopPropagation();
        openDatabaseDetail();
      }}
      size="small"
      color="secondary"
      className="!coz-fg-hglt"
    >
      {I18n.t('workflow_view_data', {}, '查看数据')}
    </Button>
  );
}
