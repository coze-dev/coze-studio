import { type Dataset, StorageLocation } from '@coze-arch/idl/knowledge';

export function getStorageStrategyEnabled(dataset?: Dataset) {
  return (
    // 云搜索只在国内环境上线
    IS_CN_REGION &&
    // 只有知识库首次上传，才可以配置云搜索
    dataset?.doc_count === 0 &&
    dataset?.storage_location === StorageLocation.Default
  );
}
