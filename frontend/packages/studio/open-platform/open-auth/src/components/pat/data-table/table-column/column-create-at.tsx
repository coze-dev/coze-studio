import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { getDetailTime } from '@/utils/time';

export const columnCreateAtConf: () => ColumnProps<PersonalAccessToken> =
  () => ({
    title: I18n.t('coze_api_list3'),
    dataIndex: 'created_at',
    render: (createTime: number) => getDetailTime(createTime),
  });
