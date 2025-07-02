import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { getTimeoutConfig } from '../utils/get-timeout-config';

/**
 * 获取超时配置
 * @returns
 */
export const useTimeoutConfig = (): {
  default: number;
  max: number;
  min: number;
  disabled: boolean;
} => {
  const node = useCurrentEntity();
  return getTimeoutConfig(node);
};
