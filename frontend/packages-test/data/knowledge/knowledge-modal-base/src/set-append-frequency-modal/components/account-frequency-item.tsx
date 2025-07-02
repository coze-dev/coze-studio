import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { FrequencyType } from '@coze-arch/bot-api/memory';
import { type AuthFrequencyInfo } from '@coze-arch/bot-api/knowledge';
import { Select } from '@coze-arch/coze-design';

interface AccountFrequencyItemProps {
  accountInfo: AuthFrequencyInfo;
  onFrequencyChange: (account: AuthFrequencyInfo) => void;
}

// TODO: hzf 需要修改为i18n
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
