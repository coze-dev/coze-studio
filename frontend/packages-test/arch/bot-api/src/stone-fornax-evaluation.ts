import StoneFornaxEvaluationService from '@coze-arch/idl/stone_fornax_evaluation';

import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention -- what can I say
export const StoneEvaluationApi =
  new StoneFornaxEvaluationService<BotAPIRequestConfig>({
    request: (params, config = {}) =>
      axiosInstance.request({
        ...params,
        ...{
          ...config,
          headers: Object.assign(config.headers || {}, {
            'Agw-Js-Conv': 'str',
          }),
        },
      }),
  });
