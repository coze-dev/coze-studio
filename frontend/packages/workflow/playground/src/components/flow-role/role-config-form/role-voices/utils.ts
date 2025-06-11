import { type VoiceConfig } from '@coze-arch/bot-api/workflow_api';

export interface VoiceValue {
  language?: string;
  data?: VoiceConfig;
}

export const formatVoicesObj2Arr = (
  value: Record<string, VoiceConfig>,
): VoiceValue[] => {
  const temp = Object.keys(value).map(lang => ({
    language: lang,
    data: value[lang],
  }));
  return temp.length ? temp : [{}];
};
