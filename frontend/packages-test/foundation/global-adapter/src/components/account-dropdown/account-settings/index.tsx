import { PatBody } from '@coze-studio/open-auth';
import {
  useAccountSettings as useBaseAccountSettings,
  UserInfoPanel,
} from '@coze-foundation/account-ui-base';
import { I18n } from '@coze-arch/i18n';

export const useAccountSettings = () => {
  const tabs = [
    {
      id: 'account',
      tabName: I18n.t('menu_profile_account'),
      content: () => <UserInfoPanel />,
    },
    {
      id: 'api-auth',
      tabName: I18n.t('settings_api_authorization'),
      content: () => <PatBody size="small" type="primary" />,
    },
  ];

  const { node, open } = useBaseAccountSettings({
    tabs,
  });
  return {
    node,
    open,
  };
};
