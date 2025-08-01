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

import { type ReactCropperElement } from 'react-cropper';
import React, { useState, type RefObject, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useGenerateImageStore } from '@coze-studio/bot-detail-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import 'cropperjs/dist/cropper.css';
import { type FileItem, type UploadProps } from '@coze-arch/bot-semi/Upload';
import { Toast, Upload } from '@coze-arch/bot-semi';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import {
  useDragImage,
  checkImageWidthAndHeight,
  UploadMode,
  MAX_IMG_SIZE,
} from '@coze-agent-ide/chat-background-shared';

import { DragUploadContent } from './drag-upload-content';
import CropperImg from './cropper';

export const checkHasFileOnDrag = (e: React.DragEvent<HTMLDivElement>) =>
  // The basis for the judgment is to directly look at the type explanation of types
  Boolean(e.dataTransfer?.types.includes('Files'));
export interface CropperUploadProps {
  pictureValue?: Partial<FileItem>;
  onChange?: (value: FileItem) => void;
  disabled?: boolean;
  uploaderRef?: RefObject<Upload>;
  cropperWebRef: RefObject<ReactCropperElement>;
  cropperMobileRef: RefObject<ReactCropperElement>;
  backgroundValue: BackgroundImageInfo[];
  getUserId: () => string;
  setUploadMode: (mode: UploadMode) => void;
  uploadMode?: UploadMode;
  renderEnhancedUpload?: (params: { aiUpload?: () => void }) => ReactNode;
}

const CopperUpload: React.FC<CropperUploadProps> = ({
  pictureValue,
  onChange,
  disabled,
  uploaderRef,
  cropperWebRef,
  cropperMobileRef,
  backgroundValue = [],
  getUserId,
  setUploadMode,
  uploadMode,
  renderEnhancedUpload,
}) => {
  const [loading, setLoading] = useState(false);
  const mobileBackgroundInfo = backgroundValue[0]?.mobile_background_image;
  const webBackgroundInfo = backgroundValue[0]?.web_background_image;

  const { onDragEnter, onDragEnd, isDragIn, onDragOver } = useDragImage();

  const { setGenerateBackgroundModalByImmer } = useGenerateImageStore(
    useShallow(state => ({
      setGenerateBackgroundModalByImmer:
        state.setGenerateBackgroundModalByImmer,
    })),
  );

  const customRequest: UploadProps['customRequest'] = async options => {
    setLoading(true);
    const { onSuccess, onError, file } = options;
    if (typeof file === 'string') {
      return;
    }
    try {
      const { fileInstance } = file;
      if (fileInstance) {
        const validateSize = await checkImageWidthAndHeight(fileInstance);
        if (validateSize) {
          onSuccess(file);
          onChange?.(file);
          // After uploading manually, you need to clear the selected state of the candidate image.
          setGenerateBackgroundModalByImmer(state => {
            state.selectedImage = {};
          });
        } else {
          setLoading(false);
        }
      } else {
        onError({
          status: 0,
        });
      }
    } catch (e) {
      setLoading(false);
      e instanceof Error &&
        logger.error({ error: e, eventName: 'poll_scene_mockset_fail' });
    }
  };
  const commonProps = {
    url: pictureValue?.url,
    loading,
    setLoading,
    getUserId,
  };

  const handleAIUpload = () => {
    setUploadMode(UploadMode.Generate);
  };

  return (
    <div className="px-6 mt-[1px]">
      <Upload
        action=""
        limit={1}
        draggable
        customRequest={customRequest}
        accept=".jpeg,.jpg,.png,.webp,.gif"
        showReplace={false}
        showUploadList={false}
        ref={uploaderRef}
        disabled={disabled}
        maxSize={MAX_IMG_SIZE}
        onDrop={onDragEnd}
        onSizeError={() => {
          Toast.error({
            content: I18n.t('upload_image_size_limit', { max_size: '10M' }),
            showClose: false,
          });
        }}
      >
        {pictureValue?.url || uploadMode === UploadMode.Generate ? (
          <div
            className="relative flex justify-between gap-3"
            onClick={e => {
              e.stopPropagation();
            }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragEnd}
          >
            <CropperImg
              mode={'pc'}
              cropperRef={cropperWebRef}
              backgroundInfo={webBackgroundInfo}
              {...commonProps}
            />
            <CropperImg
              mode={'mobile'}
              cropperRef={cropperMobileRef}
              backgroundInfo={mobileBackgroundInfo}
              {...commonProps}
            />
            {isDragIn ? (
              <div className="w-full h-full absolute z-[300]">
                <DragUploadContent mode="fill" />
              </div>
            ) : null}
          </div>
        ) : (
          <DragUploadContent
            manualUpload={() => {
              setUploadMode(UploadMode.Manual);
              uploaderRef?.current?.openFileDialog();
            }}
            renderEnhancedUpload={() =>
              renderEnhancedUpload?.({ aiUpload: handleAIUpload })
            }
          />
        )}
      </Upload>
    </div>
  );
};
export default CopperUpload;
