import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getDetailTime } from '@/utils/time';

export const columnLastUseAtConf: () => ColumnProps<PersonalAccessToken> =
  () => ({
    title: I18n.t('coze_api_list4'),
    dataIndex: 'last_used_at',
    render: (lastUseTime: number) => getDetailTime(lastUseTime),
  });
