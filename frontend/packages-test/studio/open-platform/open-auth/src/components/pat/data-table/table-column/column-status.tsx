import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/coze-design';
import { type ColumnProps } from '@coze-arch/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getStatus } from '@/utils/time';

export const columnStatusConf: () => ColumnProps<PersonalAccessToken> = () => ({
  title: I18n.t('api_status_1'),
  dataIndex: 'id',
  width: 80,
  render: (_: string, record: PersonalAccessToken) => {
    const isActive = getStatus(record?.expire_at as number);
    return (
      <Tag size="small" color={isActive ? 'primary' : 'grey'}>
        {I18n.t(isActive ? 'api_status_active_1' : 'api_status_expired_1')}
      </Tag>
    );
  },
});
