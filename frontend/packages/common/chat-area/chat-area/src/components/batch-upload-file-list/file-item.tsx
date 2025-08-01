/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
