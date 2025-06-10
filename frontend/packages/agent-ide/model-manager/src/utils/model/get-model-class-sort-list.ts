import { uniq } from 'lodash-es';
/**
 * 以 class id 首次出现的顺序进行排序
 */
export const getModelClassSortList = (classIdList: string[]) =>
  uniq(classIdList);
