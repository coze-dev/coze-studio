import { memo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { FileType } from '../../store/types';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { ImageFile } from './image-file';
import { CommonFile } from './common-file';

export const FileItem: React.FC<{ fileId: string; className?: string }> = memo(
  ({ fileId, className }) => {
    const { useBatchFileUploadStore } = useChatAreaStoreSet();
    const fileData = useBatchFileUploadStore(
      useShallow(state => state.fileDataMap[fileId]),
    );
    if (!fileData) {
      throw new Error(`failed to find FileData ${fileId}`);
    }

    if (fileData.fileType === FileType.Image) {
      return <ImageFile {...fileData} className={className} />;
    }

    return <CommonFile {...fileData} className={className} />;
  },
);

FileItem.displayName = 'ChatAreaFileItem';
