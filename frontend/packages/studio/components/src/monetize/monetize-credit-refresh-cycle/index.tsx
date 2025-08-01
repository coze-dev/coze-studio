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

import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Select } from '@coze-arch/coze-design';
import { BotMonetizationRefreshPeriod } from '@coze-arch/bot-api/benefit';

const refreshCycleTextMap: Record<BotMonetizationRefreshPeriod, string> = {
  [BotMonetizationRefreshPeriod.Unknown]: I18n.t(
    'coze_premium_credits_cycle_4',
  ),
  [BotMonetizationRefreshPeriod.Never]: I18n.t('coze_premium_credits_cycle_4'),
  [BotMonetizationRefreshPeriod.Day]: I18n.t('coze_premium_credits_cycle_1'),
  [BotMonetizationRefreshPeriod.Week]: I18n.t('coze_premium_credits_cycle_2'),
  [BotMonetizationRefreshPeriod.Month]: I18n.t('coze_premium_credits_cycle_3'),
};

const getOptionList = () => [
  {
    value: BotMonetizationRefreshPeriod.Never,
    text: refreshCycleTextMap[BotMonetizationRefreshPeriod.Never],
  },
  {
    value: BotMonetizationRefreshPeriod.Day,
    text: refreshCycleTextMap[BotMonetizationRefreshPeriod.Day],
    tooltip: I18n.t('coze_premium_credits_cycle_tip6'),
  },
  {
    value: BotMonetizationRefreshPeriod.Week,
    text: refreshCycleTextMap[BotMonetizationRefreshPeriod.Week],
    tooltip: I18n.t('coze_premium_credits_cycle_tip7'),
  },
  {
    value: BotMonetizationRefreshPeriod.Month,
    text: refreshCycleTextMap[BotMonetizationRefreshPeriod.Month],
    tooltip: I18n.t('coze_premium_credits_cycle_tip8'),
  },
];

export function MonetizeCreditRefreshCycle({
  refreshCycle,
  onRefreshCycleChange,
  disabled,
  freeCount,
}: {
  freeCount: number;
  disabled: boolean;
  refreshCycle: number;
  onRefreshCycleChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4px">
        <div className="coz-fg-primary text-lg font-medium">
          {I18n.t('coze_premium_credits_cycle_5')}
        </div>
        <Tooltip
          theme="dark"
          content={I18n.t('coze_premium_credits_cycle_tip1')}
        >
          <IconCozInfoCircle className="text-base coz-fg-secondary" />
        </Tooltip>
      </div>

      <Tooltip
        key={freeCount}
        trigger={freeCount <= 0 ? 'hover' : 'custom'}
        content={I18n.t('coze_premium_credits_cycle_tip4')}
      >
        <Select
          disabled={disabled}
          onChange={value => {
            onRefreshCycleChange(Number(value));
          }}
          value={refreshCycle}
          position="bottomRight"
          className="w-[140px]"
          renderSelectedItem={(item: Record<string, unknown>) =>
            refreshCycleTextMap[item.value as BotMonetizationRefreshPeriod]
          }
        >
          {getOptionList().map(item => (
            <Select.Option key={item.value} value={item.value}>
              <div className="mx-8px w-[100px]">{item.text}</div>
              {item.tooltip ? (
                <Tooltip theme="dark" position="right" content={item.tooltip}>
                  <IconCozInfoCircle className="mr-8px coz-fg-secondary text-base" />
                </Tooltip>
              ) : null}
            </Select.Option>
          ))}
        </Select>
      </Tooltip>
    </div>
  );
}
