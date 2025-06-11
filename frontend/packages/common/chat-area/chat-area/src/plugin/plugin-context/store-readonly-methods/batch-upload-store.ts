import { type BatchFileUploadStore } from '../../../store/batch-upload-file';

export const createGetBatchFileStoreReadonlyMethods =
  (useBatchFileStore: BatchFileUploadStore) => () => {
    const { fileDataMap, fileIdList, fileTypeMap } =
      useBatchFileStore.getState();
    return {
      fileDataMap,
      fileIdList,
      fileTypeMap,
    };
  };
