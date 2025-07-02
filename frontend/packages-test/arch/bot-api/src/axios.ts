import { Toast } from '@coze-arch/bot-semi';
import {
  axiosInstance,
  isApiError,
  type AxiosRequestConfig,
} from '@coze-arch/bot-http';

// Toast展示位置离top 80px
Toast.config({
  top: 80,
});

interface CustomAxiosConfig {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __disableErrorToast?: boolean;
}

/**
 * 业务自定义 axios 配置
 * @param __disableErrorToast default: false
 */
export type BotAPIRequestConfig = AxiosRequestConfig & CustomAxiosConfig;

axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    // 业务逻辑
    if (
      isApiError(error) &&
      error.msg &&
      !(error.config as CustomAxiosConfig).__disableErrorToast
    ) {
      Toast.error({
        content: error.msg,
        showClose: false,
      });
    }

    throw error;
  },
);

export { axiosInstance };
