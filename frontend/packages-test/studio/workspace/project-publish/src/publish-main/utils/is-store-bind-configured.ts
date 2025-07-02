import { type StoreBindKey } from '@/store';

type SelfMapping<T extends string> = {
  [K in T]: K; // 关键语法：将每个字面量类型映射为自己
};

type KeyMapping = SelfMapping<StoreBindKey>;

export const isStoreBindConfigured = (
  config: Record<string, string>,
): boolean => {
  // 防止 StoreBindKey 有变动导致 bug
  const { category_id, display_screen }: KeyMapping = {
    category_id: 'category_id',
    display_screen: 'display_screen',
  };
  return Boolean(config[category_id]) && Boolean(config[display_screen]);
};
