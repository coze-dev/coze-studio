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

import { useDebounceFn } from 'ahooks';
import { useMonetizeConfigReadonly } from '@coze-agent-ide/space-bot/hook';
import {
  MonetizeCreditRefreshCycle,
  MonetizeDescription,
  MonetizeFreeChatCount,
  MonetizeSwitch,
} from '@coze-studio/components/monetize';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useMonetizeConfigStore } from '@coze-studio/bot-detail-store';
import {
  MonetizationEntityType,
  type BotMonetizationRefreshPeriod,
} from '@coze-arch/idl/benefit';
import { benefitApi } from '@coze-arch/bot-api';

export function MonetizeConfigPanel() {
  const botId = useBotInfoStore(store => store.botId);
  const {
    isOn,
    freeCount,
    refreshCycle,
    setIsOn,
    setFreeCount,
    setRefreshCycle,
  } = useMonetizeConfigStore();
  const isReadonly = useMonetizeConfigReadonly();

  const { run: debouncedSaveBotConfig } = useDebounceFn(
    ({
      isEnable,
      freeChats,
    }: {
      isEnable: boolean;
      freeChats: number;
      refreshCycle: BotMonetizationRefreshPeriod;
    }) => {
      benefitApi.PublicSaveBotDraftMonetizationConfig({
        entity_id: botId,
        entity_type: MonetizationEntityType.Bot,
        is_enable: isEnable,
        free_chat_allowance_count: freeChats,
        refresh_period: refreshCycle,
      });
    },
    { wait: 300 },
  );

  const refreshCycleDisabled = !isOn || isReadonly || freeCount <= 0;

  return (
    <div className="w-[480px] p-[24px] flex flex-col gap-[24px]">
      <MonetizeSwitch
        disabled={isReadonly}
        isOn={isOn}
        onChange={value => {
          setIsOn(value);
          debouncedSaveBotConfig({
            isEnable: value,
            freeChats: freeCount,
            refreshCycle,
          });
        }}
      />
      <MonetizeDescription isOn={isOn} />
      <MonetizeFreeChatCount
        isOn={isOn}
        disabled={isReadonly}
        freeCount={freeCount}
        onFreeCountChange={value => {
          setFreeCount(value);
          debouncedSaveBotConfig({
            isEnable: isOn,
            freeChats: value,
            refreshCycle,
          });
        }}
      />
      <MonetizeCreditRefreshCycle
        freeCount={freeCount}
        disabled={refreshCycleDisabled}
        refreshCycle={refreshCycle}
        onRefreshCycleChange={value => {
          setRefreshCycle(value);
          debouncedSaveBotConfig({
            isEnable: isOn,
            freeChats: freeCount,
            refreshCycle: value,
          });
        }}
      />
    </div>
  );
}
