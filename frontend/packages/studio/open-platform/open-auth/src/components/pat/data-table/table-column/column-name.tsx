import { I18n } from '@coze-arch/i18n';
import { type ColumnProps } from '@coze-arch/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';
export const columnNameConf: () => ColumnProps<PersonalAccessToken> = () => ({
  title: I18n.t('coze_api_list1'),
  dataIndex: 'name',
  width: 120,
  render: (name: string) => <p>{name}</p>,
});
