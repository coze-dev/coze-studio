/**
 * @file 社区版暂不支持后台配置，用于未来拓展
 */
import { useEffect } from 'react';

import { useCommonConfigStore } from '@coze-foundation/global-store';

export const useInitCommonConfig = () => {
  const setInitialized = useCommonConfigStore(state => state.setInitialized);

  useEffect(() => {
    setInitialized();
  }, []);
};
