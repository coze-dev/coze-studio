import { useState, useEffect } from 'react';

import { Tag } from '@coze-arch/coze-design';
import { type VoiceConfig } from '@coze-arch/bot-api/workflow_api';
import { type VoiceDetail } from '@coze-arch/bot-api/multimedia_api';
import { MultimediaApi } from '@coze-arch/bot-api';

import { formatVoicesObj2Arr } from './utils';

interface RoleVoicesProps {
  value?: Record<string, VoiceConfig>;
}

export const RoleVoices: React.FC<RoleVoicesProps> = ({ value }) => {
  const [innerValue, setInnerValue] = useState<VoiceDetail[]>([]);

  const fetch = async (ids: string[]) => {
    const { data } = await MultimediaApi.APIMGetVoice({
      voice_ids: ids,
    });

    setInnerValue(data?.voices || []);
  };

  useEffect(() => {
    const ids = formatVoicesObj2Arr(value || {})
      .map(i => i.data?.voice_id)
      .filter((i): i is string => Boolean(i));
    if (!ids.length) {
      setInnerValue([]);
    } else {
      fetch(ids);
    }
  }, [value]);

  return (
    <div className="flex flex-wrap gap-[4px] mb-[8px]">
      {innerValue.map(i => (
        <Tag size="small" color="primary" key={i.voice_id}>
          {i.voice_name}({i.language_name})
        </Tag>
      ))}
    </div>
  );
};
