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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { FrequencyType } from '@coze-arch/bot-api/memory';
import { type AuthFrequencyInfo } from '@coze-arch/bot-api/knowledge';
import { Select } from '@coze-arch/coze-design';

interface AccountFrequencyItemProps {
  accountInfo: AuthFrequencyInfo;
  onFrequencyChange: (account: AuthFrequencyInfo) => void;
}

// TODO: hzf needs to be changed to i18n.
const FREQUENCY_OPTIONS = [
  { label: I18n.t('knowledge_weixin_015'), value: FrequencyType.None },
  { label: I18n.t('knowledge_weixin_016'), value: FrequencyType.EveryDay },
  { label: I18n.t('knowledge_weixin_017'), value: FrequencyType.EveryThreeDay },
  { label: I18n.t('knowledge_weixin_018'), value: FrequencyType.EverySevenDay },
];

export const AccountFrequencyItem = ({
  accountInfo,
  onFrequencyChange,
}: AccountFrequencyItemProps) => {
  const [frequency, setFrequency] = useState<FrequencyType>(
    accountInfo.auth_frequency_type,
  );

  const handleFrequencyChange = (value: FrequencyType) => {
    setFrequency(value);
    onFrequencyChange({
      ...accountInfo,
      auth_frequency_type: value,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="text-[14px] coz-fg-primary mb-1 font-medium">
        {accountInfo.auth_name}
      </div>
      <Select
        value={frequency}
        onChange={value => handleFrequencyChange(value as FrequencyType)}
        optionList={FREQUENCY_OPTIONS}
        className="w-full"
      />
    </div>
  );
};
