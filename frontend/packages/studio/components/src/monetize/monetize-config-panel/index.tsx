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
import { type BotMonetizationRefreshPeriod } from '@coze-arch/bot-api/benefit';

import { MonetizeSwitch } from '../monetize-switch';
import { MonetizeFreeChatCount } from '../monetize-free-chat-count';
import { MonetizeDescription } from '../monetize-description';
import { MonetizeCreditRefreshCycle } from '../monetize-credit-refresh-cycle';

export interface MonetizeConfigValue {
  /** Whether to start payment */
  isOn: boolean;
  /** The number of free user experiences after starting payment */
  freeCount: number;
  /** refresh cycle */
  refreshCycle: BotMonetizationRefreshPeriod;
}

interface MonetizeConfigPanelProps {
  disabled?: boolean;
  value: MonetizeConfigValue;
  onChange: (value: MonetizeConfigValue) => void;
  /**
   * The onChange event after built-in anti-shake can be selectively used by the business side. Normally, only onChange can be transmitted.
   * (Since this component is a fully controlled component, you cannot just pass onDebouncedChange, you must pass onChange to update the view in real time)
   */
  onDebouncedChange?: (value: MonetizeConfigValue) => void;
}

export function MonetizeConfigPanel({
  disabled = false,
  value,
  onChange,
  onDebouncedChange,
}: MonetizeConfigPanelProps) {
  const { run: debouncedChange } = useDebounceFn(
    ({ isOn, freeCount, refreshCycle }: MonetizeConfigValue) => {
      onDebouncedChange?.({
        isOn,
        freeCount,
        refreshCycle,
      });
    },
    { wait: 300 },
  );

  const refreshCycleDisabled = !value.isOn || disabled || value.freeCount <= 0;

  return (
    <div className="w-[480px] p-[24px] flex flex-col gap-[24px]">
      <MonetizeSwitch
        disabled={disabled}
        isOn={value.isOn}
        onChange={v => {
          onChange({ ...value, isOn: v });
          debouncedChange({
            ...value,
            isOn: v,
          });
        }}
      />
      <MonetizeDescription isOn={value.isOn} />
      <MonetizeFreeChatCount
        isOn={value.isOn}
        disabled={disabled}
        freeCount={value.freeCount}
        onFreeCountChange={v => {
          onChange({ ...value, freeCount: v });
          debouncedChange({
            ...value,
            freeCount: v,
          });
        }}
      />
      <MonetizeCreditRefreshCycle
        freeCount={value.freeCount}
        disabled={refreshCycleDisabled}
        refreshCycle={value.refreshCycle}
        onRefreshCycleChange={v => {
          onChange({ ...value, refreshCycle: v });
          debouncedChange({ ...value, refreshCycle: v });
        }}
      />
    </div>
  );
}
