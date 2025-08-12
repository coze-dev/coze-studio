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
import { type RefObject } from 'react';

import { logger } from '@coze-arch/logger';
import { type FileItem } from '@coze-arch/bot-semi/Upload';
import {
  type BackgroundImageDetail,
  type BackgroundImageInfo,
} from '@coze-arch/bot-api/developer_api';

import { canvasPosition, computePosition, computeThemeColor } from './utils';
import { useUploadImage } from './use-upload-image';

export interface SubmitCroppedImageParams {
  cropperWebRef: RefObject<ReactCropperElement>;
  cropperMobileRef: RefObject<ReactCropperElement>;
  setLoading: (loading: boolean) => void;
  onSuccess: (value: BackgroundImageInfo) => void;
  currentOriginImage: Partial<FileItem>;
  handleCancel: () => void;
  onAuditCheck: (notPass: boolean) => void;
}

export interface FileValue {
  uri: string;
  url: string;
}

interface GetBackgroundInfoItemParams {
  mode: 'pc' | 'mobile';
  originImageInfo: {
    origin_image_uri: string;
    origin_image_url: string;
  };
  themeColorList: string[];
}
export const useSubmitCroppedImage = ({
  cropperWebRef,
  cropperMobileRef,
  setLoading,
  onSuccess,
  currentOriginImage,
  handleCancel,
}: SubmitCroppedImageParams) => {
  const getBackgroundInfoItem = ({
    mode,
    originImageInfo,
    themeColorList,
  }: GetBackgroundInfoItemParams): BackgroundImageDetail => {
    const cropperRef = mode === 'pc' ? cropperWebRef : cropperMobileRef;
    return {
      ...originImageInfo,
      theme_color: mode === 'pc' ? themeColorList[0] : themeColorList[1],
      gradient_position: computePosition(mode, cropperRef),
      canvas_position: canvasPosition(cropperRef),
    };
  };

  const handleUploadAllSuccess = async (croppedImage?: FileValue) => {
    setLoading(false);

    const themeColorList = await computeThemeColor([
      cropperWebRef,
      cropperMobileRef,
    ]);

    if (!currentOriginImage?.url) {
      return;
    }

    const originImageInfo = {
      origin_image_uri: croppedImage?.uri || currentOriginImage.uri,
      origin_image_url: croppedImage?.url || currentOriginImage.url,
    };
    const info = {
      themeColorList,
      originImageInfo,
    };
    const backgroundImage = {
      web_background_image: getBackgroundInfoItem({
        mode: 'pc',
        ...info,
      }),
      mobile_background_image: getBackgroundInfoItem({
        mode: 'mobile',
        ...info,
      }),
    };

    onSuccess(backgroundImage);
    handleCancel();
  };
  const { upload } = useUploadImage({
    onUploadSuccess: handleUploadAllSuccess,
    onUploadError: () => {
      setLoading(false);
    },
  });

  const handleSubmit = () => {
    setLoading(true);

    try {
      if (
        currentOriginImage?.fileInstance &&
        currentOriginImage?.fileInstance instanceof File
      ) {
        upload(currentOriginImage.fileInstance);
      } else {
        // When backfilling the document, there is no need to save the original image.
        handleUploadAllSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ error });
      }
    }
  };

  return { handleSubmit };
};
