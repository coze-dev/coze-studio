import { useState } from 'react';

import { useRequest } from 'ahooks';
import { PlaygroundApi } from '@coze-arch/bot-api';

export interface LanguageOption {
  languageCode: string;
  languageName: string;
}

export const useLanguageOptions = () => {
  const [options, setOptions] = useState<LanguageOption[]>([]);

  const { loading } = useRequest(() => PlaygroundApi.GetSupportLanguage(), {
    onSuccess: res =>
      setOptions(
        res.language_list?.map(item => ({
          languageCode: item.language_code ?? '',
          languageName: item.language_name ?? '',
        })) ?? [],
      ),
    onError: () => setOptions([]),
  });

  return { loading, options };
};
