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
import React, { createRef, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  DotStatus,
  useGenerateImageStore,
} from '@coze-studio/bot-detail-store';
import { type FileItem } from '@coze-arch/bot-semi/Upload';
import { type Upload } from '@coze-arch/bot-semi';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import { AuditErrorMessage } from '@coze-studio/bot-audit-adapter';
import {
  getInitBackground,
  UploadMode,
  useBackgroundContent,
  useSubmitCroppedImage,
} from '@coze-agent-ide/chat-background-shared';

import CropperUpload, { type CropperUploadProps } from './cropper-upload';
import { CropperFooter } from './cropper-footer';

type PictureOnchangeCallback = (value: Partial<FileItem>) => void;
export interface BackgroundConfigContentProps
  extends Pick<CropperUploadProps, 'renderEnhancedUpload'> {
  onSuccess: (value: BackgroundImageInfo[]) => void;
  backgroundValue: BackgroundImageInfo[];
  getUserId: () => {
    userId: string;
  };
  cancel: () => void;
  renderUploadSlot?: (params: {
    pictureOnChange: PictureOnchangeCallback;
    pictureUrl: string | undefined;
    uploadMode: UploadMode;
  }) => React.ReactNode;
}
export const BackgroundConfigContent: React.FC<
  BackgroundConfigContentProps
> = ({
  backgroundValue = [],
  getUserId,
  onSuccess,
  cancel,
  renderUploadSlot,
  renderEnhancedUpload,
}) => {
  const uploaderRef = useRef<Upload>(null);
  const cropperWebRef = createRef<ReactCropperElement>();
  const cropperMobileRef = createRef<ReactCropperElement>();

  const [loading, setLoading] = useState(false);
  const [auditNotPass, setAuditNotPass] = useState(false);

  const {
    selectedImageInfo,
    isGenerateSuccess,
    setGenerateBackgroundModalByImmer,
  } = useGenerateImageStore(
    useShallow(state => ({
      selectedImageInfo: state.generateBackGroundModal.selectedImage?.img_info,
      isGenerateSuccess:
        state.generateBackGroundModal.gif.dotStatus === DotStatus.Success ||
        state.generateBackGroundModal.image.dotStatus === DotStatus.Success,
      setGenerateBackgroundModalByImmer:
        state.setGenerateBackgroundModalByImmer,
    })),
  );
  // Initialize the display in the drag-and-drop box of the graph: AI-generated successful display generated > history settings background cover > empty
  const initPicture = getInitBackground({
    isGenerateSuccess,
    originBackground: backgroundValue,
    selectedImageInfo,
  });
  const { showDot } = useBackgroundContent();
  const initUploadMode =
    showDot || initPicture.url ? UploadMode.Generate : UploadMode.Manual;
  const [uploadMode, setUploadMode] = useState<UploadMode>(initUploadMode);

  const [pictureValue, setPictureValue] =
    useState<Partial<FileItem>>(initPicture);
  const pictureUrl = pictureValue?.url;

  useEffect(() => {
    // Initialization logic: Initialize the graph, not the selected graph, update the selected state of the candidate graph
    if (initPicture.url !== selectedImageInfo?.tar_url) {
      setGenerateBackgroundModalByImmer(state => {
        state.selectedImage = {
          img_info: {
            tar_uri: initPicture.uri,
            tar_url: initPicture.url,
          },
        };
      });
    }
  }, []);

  useEffect(() => {
    // After receiving the AI generated picture successfully, update the picture currently displayed in the crop box.
    if (selectedImageInfo) {
      setPictureValue({
        uri: selectedImageInfo?.tar_uri,
        url: selectedImageInfo?.tar_url,
      });
      setAuditNotPass(false);
    }
  }, [selectedImageInfo?.tar_url]);

  const handleCancel = () => {
    cancel();
    clearAllSideEffect();
  };

  const clearAllSideEffect = () => {
    [cropperWebRef, cropperMobileRef].forEach(item => {
      item.current?.cropper?.destroy();
    });
  };

  const { handleSubmit } = useSubmitCroppedImage({
    onSuccess,
    handleCancel,
    cropperWebRef,
    cropperMobileRef,
    currentOriginImage: pictureValue ?? {},
    setLoading,
    getUserId,
    onAuditCheck(notPass) {
      setAuditNotPass(notPass);
    },
  });

  const pictureOnChange: PictureOnchangeCallback = value => {
    setPictureValue(value);
    setAuditNotPass(false);
  };

  return (
    <React.Fragment>
      <div className="flex flex-col overflow-hidden	flex-auto relative">
        <CropperUpload
          pictureValue={pictureValue}
          onChange={pictureOnChange}
          uploaderRef={uploaderRef}
          cropperWebRef={cropperWebRef}
          cropperMobileRef={cropperMobileRef}
          backgroundValue={backgroundValue}
          getUserId={() => getUserId().userId}
          setUploadMode={setUploadMode}
          uploadMode={uploadMode}
          renderEnhancedUpload={renderEnhancedUpload}
        />
        {renderUploadSlot?.({ pictureOnChange, pictureUrl, uploadMode })}
      </div>

      {pictureUrl || uploadMode === UploadMode.Generate ? (
        <CropperFooter
          handleOpenFileDialog={() => uploaderRef.current?.openFileDialog()}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          loading={loading}
          disabledConfig={{
            upload: !pictureUrl && uploadMode === UploadMode.Manual,
            submit: !pictureUrl,
          }}
        />
      ) : null}
      {auditNotPass ? (
        <div className="pb-6 coz-bg-max px-6">
          <AuditErrorMessage />
        </div>
      ) : null}
    </React.Fragment>
  );
};
