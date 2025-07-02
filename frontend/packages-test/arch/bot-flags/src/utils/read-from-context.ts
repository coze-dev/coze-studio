import { type FEATURE_FLAGS } from '../types';

export const readFgPromiseFromContext = async (): Promise<
  FEATURE_FLAGS | undefined
> => {
  const { __fetch_fg_promise__: globalFetchFgPromise } = window;
  if (globalFetchFgPromise) {
    const res = await globalFetchFgPromise;
    return res.data as FEATURE_FLAGS;
  }
  return undefined;
};

export const readFgValuesFromContext = () => {
  const { __fg_values__: globalFgValues } = window;
  if (globalFgValues && Object.keys(globalFgValues).length > 0) {
    return globalFgValues as FEATURE_FLAGS;
  }
  return undefined;
};
