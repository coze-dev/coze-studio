import { useShallow } from 'zustand/react/shallow';

import { getBotDetailIsReadonlyByState } from '../utils/get-read-only';
import { usePageRuntimeStore } from '../store/page-runtime';
import { useCollaborationStore } from '../store/collaboration';

export const useBotDetailIsReadonly = (): boolean => {
  const { editable, isPreview } = usePageRuntimeStore(
    useShallow(state => ({
      editable: state.editable,
      isPreview: state.isPreview,
    })),
  );
  const editLockStatus = useCollaborationStore(state => state.editLockStatus);
  return getBotDetailIsReadonlyByState({
    editable,
    isPreview,
    editLockStatus,
  });
};
