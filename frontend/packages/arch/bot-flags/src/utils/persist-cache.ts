import { logger } from '@coze-arch/logger';

import { type FEATURE_FLAGS } from '../types';
import { PACKAGE_NAMESPACE } from '../constant';
import { nextTick } from './wait';

const PERSIST_CACHE_KEY = 'cache:@coze-arch/bot-flags';

const isFlagsShapeObj = (obj: unknown) => {
  if (typeof obj === 'object') {
    const shape = obj as FEATURE_FLAGS;
    return (
      // 如果包含任意属性值不是 boolean，则认为不是 flags 对象
      Object.keys(shape).some(r => typeof shape[r] !== 'boolean') === false
    );
  }
  return false;
};

export const readFromCache = async (): Promise<FEATURE_FLAGS | undefined> => {
  await Promise.resolve(undefined);
  const content = window.localStorage.getItem(PERSIST_CACHE_KEY);
  if (!content) {
    return undefined;
  }
  try {
    const res = JSON.parse(content);
    if (isFlagsShapeObj(res)) {
      return res;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
};

export const saveToCache = async (flags: FEATURE_FLAGS) => {
  await nextTick();
  try {
    if (isFlagsShapeObj(flags)) {
      const content = JSON.stringify(flags);
      window.localStorage.setItem(PERSIST_CACHE_KEY, content);
    }
  } catch (e) {
    // do nothing
    logger.persist.error({
      namespace: PACKAGE_NAMESPACE,
      message: 'save fg failure',
      error: e as Error,
    });
  }
};
