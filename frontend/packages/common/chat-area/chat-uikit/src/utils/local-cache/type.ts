export interface StoreStruct {
  coze_home_mention_tip_showed: boolean;
  coze_home_favorite_list_display: boolean;
  coze_home_favorite_list_filter: 'all' | 'byMe';
}

export type LocalCacheKey = keyof StoreStruct;

type StoreStructRange = Record<keyof StoreStruct, boolean | string | number>;

const storeStructRangeCheck = (range: StoreStructRange) => 0;
declare const voidStruct: StoreStruct;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 类型测试
const dryRun = () => storeStructRangeCheck(voidStruct);
