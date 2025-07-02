import { safeAsyncThrow } from './safe-async-throw';

export const flatMapByKeyList = <T>(
  map: Map<string, T>,
  arr: string[],
): T[] => {
  const res: T[] = [];
  for (const key of arr) {
    const val = map.get(key);
    if (!val) {
      safeAsyncThrow(`[flatMapByKeyList] cannot find ${key} in map`);
      continue;
    }
    res.push(val);
  }
  return res;
};
