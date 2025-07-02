import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getExpirationTime } from '@/utils/time';

export const columnExpireAtConf: () => ColumnProps<PersonalAccessToken> =
  () => ({
    title: I18n.t('expire_time_1'), // 状态
    dataIndex: 'expire_at',
    render: (expireTime: number) => getExpirationTime(expireTime),
  });
