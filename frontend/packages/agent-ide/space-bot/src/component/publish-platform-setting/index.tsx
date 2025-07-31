/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef, useState } from 'react';

import { EnterpriseRoleType } from '@coze-arch/idl/pat_permission_api';
import { I18n } from '@coze-arch/i18n';
import { Space } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  useCurrentEnterpriseRoles,
  useIsCurrentPersonalEnterprise,
} from '@coze-foundation/enterprise-store-adapter';

import { NormalPlatform } from './normal';
import { CustomPlatform } from './custom';

import s from './index.module.less';

enum ETab {
  // custom channel
  Custom = 'custom',
  // common channel
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
      {/* You only need to display tabs when you are an enterprise administrator. */}
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
        {/* You only need to display tabs when you are an enterprise administrator. */}
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
