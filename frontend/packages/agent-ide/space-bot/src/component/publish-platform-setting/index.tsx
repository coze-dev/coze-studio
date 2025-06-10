import { useEffect, useRef, useState } from 'react';

import { EnterpriseRoleType } from '@coze-arch/idl/pat_permission_api';
import { I18n } from '@coze-arch/i18n';
import { Space } from '@coze/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  useCurrentEnterpriseRoles,
  useIsCurrentPersonalEnterprise,
} from '@coze-foundation/enterprise-store-adapter';

import { NormalPlatform } from './normal';
import { CustomPlatform } from './custom';

import s from './index.module.less';

enum ETab {
  // 自定义渠道
  Custom = 'custom',
  // 通用渠道
  Normal = 'normal',
}
const PublishPlatformSetting = () => {
  const [current, setCurrent] = useState(ETab.Normal);

  const contentRef = useRef<HTMLDivElement>();

  useEffect(() => {
    sendTeaEvent(EVENT_NAMES.settings_oauth_page_show);
  }, []);

  const roleList = useCurrentEnterpriseRoles();

  const isCurrentPersonalEnterprise = useIsCurrentPersonalEnterprise();
  const isEnterpriseAdmin = roleList.some(role =>
    [EnterpriseRoleType.super_admin, EnterpriseRoleType.admin].includes(role),
  );

  const showCustomTab = isCurrentPersonalEnterprise || isEnterpriseAdmin;

  return (
    <div className="pt-[10px] w-full h-full" ref={contentRef}>
      {/* 为企业管理员时才需要显示 tab */}
      {showCustomTab ? (
        <Space spacing={16} className="mb-[16px]">
          <span
            onClick={() => setCurrent(ETab.Normal)}
            className={`font-medium leading-[32px] cursor-pointer ${
              current === ETab.Normal
                ? 'text-[var(--coz-fg-hglt)]'
                : 'text-[var(--coz-fg-secondary)]'
            }`}
          >
            {I18n.t('auth_tab_auth')}
          </span>
          <span
            onClick={() => setCurrent(ETab.Custom)}
            className={`font-medium leading-[32px] cursor-pointer ${
              current === ETab.Custom
                ? 'text-[var(--coz-fg-hglt)]'
                : 'text-[var(--coz-fg-secondary)]'
            }`}
          >
            {I18n.t(
              isCurrentPersonalEnterprise
                ? 'coze_custom_publish_platform_2'
                : 'publish_channel_control_page_channel_set_management',
            )}
          </span>
        </Space>
      ) : null}
      <div className={s['publish-platform-frame']}>
        {/* 为企业管理员时才需要显示 tab */}
        {showCustomTab ? (
          <>
            {current === ETab.Normal && <NormalPlatform />}
            {current === ETab.Custom && (
              <CustomPlatform contentRef={contentRef} />
            )}
          </>
        ) : (
          <NormalPlatform />
        )}
      </div>
    </div>
  );
};

export { PublishPlatformSetting };
