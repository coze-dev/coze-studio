import KnowledgeService from './idl/knowledge';
import { axiosInstance, type BotAPIRequestConfig } from './axios';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const KnowledgeApi = new KnowledgeService<BotAPIRequestConfig>({
  request: (params, config = {}) => {
    const { headers } = config;
    const reqHeaders = {
      ...headers,
      'Agw-Js-Conv': 'str',
    };
    return axiosInstance.request({ ...params, ...config, headers: reqHeaders });
  },
});
