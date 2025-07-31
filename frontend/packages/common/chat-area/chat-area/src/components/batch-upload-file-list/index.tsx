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

import { useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useSize } from 'ahooks';

import { FileType } from '../../store/types';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { useUploadController } from '../../context/upload-controller-context';
import { FileItem } from './file-item';

import s from './index.module.less';

const enum LayoutType {
  Small = 'small',
  Middle = 'middle',
}

export const BatchUploadFileList = () => {
  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  const { fileIdList, getFileType } = useBatchFileUploadStore(
    useShallow(state => ({
      fileIdList: state.fileIdList,
      getFileType: state.getFileType,
    })),
  );

  const [layoutType, setLayoutType] = useState<LayoutType>(LayoutType.Small);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileTypeFileIdList = fileIdList.filter(
    fileId => getFileType(fileId) === FileType.File,
  );

  const imageTypeFileIdList = fileIdList.filter(
    fileId => getFileType(fileId) === FileType.Image,
  );

  const uploadController = useUploadController();
  const dispose = () => {
    uploadController.clearAllSideEffect();
    useBatchFileUploadStore.getState().clearAllData();
  };
  useEffect(() => dispose, []);

  const size = useSize(containerRef);

  useEffect(() => {
    const { width = 0 } = size ?? {};
    if (width <= 500) {
      if (layoutType === LayoutType.Small) {
        return;
      }
      setLayoutType(LayoutType.Small);
    } else {
      if (layoutType === LayoutType.Middle) {
        return;
      }
      setLayoutType(LayoutType.Middle);
    }
  }, [size]);

  if (!fileIdList.length) {
    return null;
  }

  return (
    <div
      className={classNames(
        s['upload-file-list'],
        'grid grid-flow-row gap-y-[12px]',
      )}
      ref={containerRef}
    >
      {Boolean(fileTypeFileIdList.length) && (
        <div
          className={classNames('grid gap-[6px] w-full', {
            'grid-cols-3': layoutType === LayoutType.Middle,
            'grid-cols-2': layoutType === LayoutType.Small,
          })}
        >
          {fileTypeFileIdList.map(fileId => (
            <FileItem key={fileId} fileId={fileId} />
          ))}
        </div>
      )}

      {Boolean(imageTypeFileIdList.length) && (
        <div className={classNames('flex flex-row w-full flex-wrap -mb-[6px]')}>
          {imageTypeFileIdList.map((fileId, index) => (
            <FileItem
              key={fileId}
              fileId={fileId}
              className={classNames('mb-[6px]', {
                'mr-[6px]': index < imageTypeFileIdList.length - 1,
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
};
