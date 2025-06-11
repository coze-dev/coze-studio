import React, { useState } from 'react';

import { useRequest } from 'ahooks';
import {
  MonetizeConfigPanel,
  type MonetizeConfigValue,
} from '@coze-studio/components/monetize';
import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { I18n } from '@coze-arch/i18n';
import { IconCozWallet } from '@coze/coze-design/icons';
import { Popover } from '@coze/coze-design';
import {
  BotMonetizationRefreshPeriod,
  MonetizationEntityType,
} from '@coze-arch/bot-api/benefit';
import { benefitApi } from '@coze-arch/bot-api';
import { ProjectRoleType, useProjectRole } from '@coze-common/auth';
import { useProjectId } from '@coze-project-ide/framework';

export function MonetizeConfig() {
  const projectId = useProjectId();
  const myRoles = useProjectRole(projectId);
  const [monetizeConfig, setMonetizeConfig] = useState<MonetizeConfigValue>({
    isOn: true,
    freeCount: 0,
    refreshCycle: BotMonetizationRefreshPeriod.Never,
  });

  const { data, loading } = useRequest(
    () =>
      benefitApi.PublicGetBotMonetizationConfig({
        entity_id: projectId,
        entity_type: MonetizationEntityType.Project,
      }),
    {
      onSuccess: res => {
        setMonetizeConfig({
          isOn: res.data?.is_enable ?? true,
          freeCount: res.data?.free_chat_allowance_count ?? 0,
          refreshCycle:
            res.data?.refresh_period ?? BotMonetizationRefreshPeriod.Never,
        });
      },
    },
  );

  /** loading 时展示为激活态（默认值） */
  const btnDisplayOn = loading ? true : monetizeConfig.isOn;

  return (
    <Popover
      // 我服了，trigger 动态更新不生效，原因不明。必须依靠 key 重新挂载
      key={loading || !data?.data ? 'custom' : 'click'}
      trigger={loading || !data?.data ? 'custom' : 'click'}
      autoAdjustOverflow={true}
      content={
        <MonetizeConfigPanel
          disabled={!myRoles.includes(ProjectRoleType.Owner)}
          value={monetizeConfig}
          onChange={setMonetizeConfig}
          onDebouncedChange={val => {
            benefitApi.PublicSaveBotDraftMonetizationConfig({
              entity_id: projectId,
              entity_type: MonetizationEntityType.Project,
              is_enable: val.isOn,
              free_chat_allowance_count: val.freeCount,
              refresh_period: val.refreshCycle,
            });
          }}
        />
      }
    >
      <CollapsibleIconButton
        itemKey={Symbol.for('monetize-btn')}
        icon={<IconCozWallet className="text-[16px]" />}
        text={
          btnDisplayOn ? I18n.t('monetization_on') : I18n.t('monetization_off')
        }
        color={btnDisplayOn ? 'highlight' : 'secondary'}
      />
    </Popover>
  );
}
