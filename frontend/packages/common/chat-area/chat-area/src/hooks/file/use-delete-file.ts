import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { useUploadController } from '../../context/upload-controller-context';

export const useDeleteFile = () => {
  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  const { cancelUploadById } = useUploadController();
  return (fileId: string) => {
    const { immerDeleteFileDataById } = useBatchFileUploadStore.getState();
    immerDeleteFileDataById(fileId);
    cancelUploadById(fileId);
  };
};
