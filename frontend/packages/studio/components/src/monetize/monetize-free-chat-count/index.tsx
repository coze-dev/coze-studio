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
import { InputNumber, Tooltip } from '@coze-arch/coze-design';

export function MonetizeFreeChatCount({
  isOn,
  disabled,
  freeCount,
  onFreeCountChange,
}: {
  isOn: boolean;
  disabled: boolean;
  freeCount: number;
  onFreeCountChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center font-semibold leading-[20px]">
          <span className="coz-fg-primary">
            {I18n.t('free_chat_allowance')}
          </span>
          <Tooltip theme="dark" content={I18n.t('free_chat_allowance_tips')}>
            <span className="ml-[4px] h-[12px] w-[12px] text-[12px] leading-[12px] coz-fg-secondary">
              <IconCozInfoCircle />
            </span>
          </Tooltip>
        </div>
        <div className="coz-fg-secondary text-base leading-[16px]">
          {freeCount > 5
            ? I18n.t('coze_premium_credits_cycle_tip2')
            : I18n.t('coze_premium_credits_cycle_tip3')}
        </div>
      </div>

      <InputNumber
        keepFocus
        className="w-[140px]"
        disabled={!isOn || disabled}
        precision={0}
        min={0}
        max={100}
        value={freeCount}
        onNumberChange={onFreeCountChange}
      />
    </div>
  );
}
