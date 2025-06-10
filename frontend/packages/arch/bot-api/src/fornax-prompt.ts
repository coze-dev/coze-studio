import FornaxPromptService from '@coze-arch/idl/prompt_api';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export const fornaxPromptApi = new FornaxPromptService<BotAPIRequestConfig>({
  request: (params, config = {}) =>
    axiosInstance.request({
      ...params,
      ...config,
      headers: { ...params.headers, ...config.headers, ['Agw-Js-Conv']: 'str' },
    }),
});
