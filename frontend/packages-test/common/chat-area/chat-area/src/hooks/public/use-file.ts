import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useFile = () => {
  const { useBatchFileUploadStore } = useChatAreaStoreSet();

  const actions = useBatchFileUploadStore(
    useShallow(state => ({
      immerCreateFileData: state.immerCreateFileData,
      immerDeleteFileDataById: state.immerDeleteFileDataById,
      immerUpdateFileDataById: state.immerUpdateFileDataById,
    })),
  );

  const fileState = useBatchFileUploadStore(
    useShallow(state => ({
      idList: state.fileIdList,
    })),
  );

  return {
    ...actions,
    ...fileState,
  };
};
