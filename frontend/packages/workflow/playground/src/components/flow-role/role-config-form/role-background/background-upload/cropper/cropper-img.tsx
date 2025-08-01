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

import Cropper, { type ReactCropperElement } from 'react-cropper';
import React, { type RefObject } from 'react';

import { debounce } from 'lodash-es';
import classNames from 'classnames';
import { WithRuleImgBackground } from '@coze-common/chat-uikit';
import { type BackgroundImageDetail } from '@coze-arch/bot-api/developer_api';

import { useCropperImg } from './use-crop-image';
import { CropperCover } from './cropper-cover';

import s from './cropper-img.module.less';

import 'cropperjs/dist/cropper.css';

interface CropperProps {
  url?: string;
  cropperRef: RefObject<ReactCropperElement>;
  accept?: string;
  mode?: 'pc' | 'mobile';

  loading: boolean;
  setLoading: (loading: boolean) => void;
  backgroundInfo?: BackgroundImageDetail;
}

export const CropperImg: React.FC<CropperProps> = ({
  url = '',
  mode = 'pc',
  cropperRef,
  loading,
  setLoading,
  backgroundInfo,
}) => {
  const {
    handleCrop,
    handleReady,
    themeColor,
    gradientPosition,
    size,
    onZoom,
    cropEnd,
  } = useCropperImg({
    url,
    mode,
    cropperRef,
    setLoading,
    backgroundInfo,
  });

  const currentBackgroundInfo: BackgroundImageDetail = {
    image_url: url,
    gradient_position: gradientPosition,
    theme_color: themeColor,
  };

  const debouncedZoom = debounce(onZoom, 100);
  return (
    <div
      className={`${classNames(
        s['cropper-container'],
      )} outline outline-1 outline-[#0607091A] hover:outline-[#4E40E5]`}
      style={{ background: themeColor, height: size.height, width: size.width }}
    >
      <CropperCover mode={mode} loading={loading} hasUrl={!!url} />
      <WithRuleImgBackground
        key={mode}
        backgroundInfo={{
          web_background_image: mode === 'pc' ? currentBackgroundInfo : {},
          mobile_background_image:
            mode === 'mobile' ? currentBackgroundInfo : {},
        }}
        preview
      />
      {url ? (
        <Cropper
          ready={handleReady}
          initialAspectRatio={size.width / size.height}
          src={url}
          style={{ height: size.height, width: size.width }}
          background={false} // Whether to display a grid background within the container
          guides={false}
          zoom={debouncedZoom}
          ref={cropperRef}
          dragMode="move" // Image container removable
          viewMode={0} // Define the view mode of the cropper, 0 allows the cropping box to extend beyond the image container
          modal={false} // Whether to display a black mask between the image and the crop box
          center={false}
          cropBoxMovable={false} // Whether you can drag and drop the crop box, the default is true.
          cropBoxResizable={false} // Default true, whether to allow dragging, change the size of the crop box
          highlight={false}
          autoCropArea={1}
          minCanvasHeight={size.height}
          minCropBoxHeight={size.height}
          minCropBoxWidth={size.width}
          minContainerWidth={size.width}
          crop={handleCrop}
          cropend={cropEnd}
          checkCrossOrigin={false}
          checkOrientation={false}
          crossOrigin={'anonymous'}
        />
      ) : null}
    </div>
  );
};
