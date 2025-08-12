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

import React, { useState } from 'react';

import { useRequest } from 'ahooks';
import {
  MonetizeConfigPanel,
  type MonetizeConfigValue,
} from '@coze-studio/components/monetize';
import { CollapsibleIconButton } from '@coze-studio/components/collapsible-icon-button';
import { I18n } from '@coze-arch/i18n';
import { IconCozWallet } from '@coze-arch/coze-design/icons';
import { Popover } from '@coze-arch/coze-design';
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

  /** Show as active when loading (default) */
  const btnDisplayOn = loading ? true : monetizeConfig.isOn;

  return (
    <Popover
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
