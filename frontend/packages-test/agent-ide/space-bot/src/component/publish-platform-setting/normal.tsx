import { I18n } from '@coze-arch/i18n';
import { Table, type ColumnProps } from '@coze-arch/coze-design';
import {
  type AuthStatus,
  type UserAuthInfo,
} from '@coze-arch/bot-api/developer_api';

import { useNormalPlatformController } from '@/hook/publish-platform-setting/use-normal-platform-controller';

import { AuthorizeButton } from '../authorize-button';
import { TagWithStatus } from './tag-with-status';
import { NameWithIcon } from './name-with-icon';

const NormalPlatform = () => {
  const { userAuthInfos, revokeSuccess } = useNormalPlatformController();

  const columns: ColumnProps<UserAuthInfo>[] = [
    {
      title: I18n.t('coze_custom_publish_platform_6'),
      dataIndex: 'name',
      render: (name, record) => <NameWithIcon name={name} icon={record.icon} />,
    },
    {
      title: I18n.t('analytic_query_status'),
      dataIndex: 'auth_status',
      align: 'center',
      render: authStatus => (
        <TagWithStatus prefix="auth" status={authStatus as AuthStatus} />
      ),
    },
    {
      title: I18n.t('coze_custom_publish_platform_11'),
      align: 'right',
      render: (_, record) => (
        <AuthorizeButton
          isV2
          origin="setting"
          id={record.id}
          channelName={record.name}
          status={record.auth_status}
          revokeSuccess={revokeSuccess}
          authInfo={record.auth_login_info}
        />
      ),
    },
  ];

  return (
    <>
      <p className="text-[14px] leading-[20px] text-[var(--coz-fg-primary)] mb-[24px]">
        {I18n.t('user_connections_desc')}
      </p>
      <Table
        tableProps={{
          columns,
          dataSource: userAuthInfos,
          rowKey: 'id',
        }}
      />
    </>
  );
};

export { NormalPlatform };
