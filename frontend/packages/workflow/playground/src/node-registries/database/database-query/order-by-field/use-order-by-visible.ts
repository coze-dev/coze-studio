import { useQueryFieldIDs } from './use-query-field-ids';

// 当前如果查询字段为空 则排序字段不显示
export function useOrderByVisible() {
  const queryFieldIDs = useQueryFieldIDs();

  return queryFieldIDs.length > 0;
}
