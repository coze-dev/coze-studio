import { useState, useEffect } from 'react';

import { featureFlagStorage } from './utils/storage';
import { type FEATURE_FLAGS } from './types';
import { getFlags } from './get-flags';

export const useFlags = (): [FEATURE_FLAGS] => {
  const plainFlags = getFlags();
  // 监听 fg store 事件，触发 react 组件响应变化
  const [, setTick] = useState<number>(0);

  useEffect(() => {
    const cb = () => {
      setTick(Date.now());
    };
    featureFlagStorage.on('change', cb);
    return () => {
      featureFlagStorage.off('change', cb);
    };
  }, []);

  return [plainFlags];
};
