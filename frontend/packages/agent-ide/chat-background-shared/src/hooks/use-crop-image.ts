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
import { type RefObject, useState, useEffect, useRef } from 'react';

import { ceil, floor } from 'lodash-es';
import { MODE_CONFIG } from '@coze-common/chat-uikit';
import {
  type BackgroundImageDetail,
  type GradientPosition,
} from '@coze-arch/bot-api/developer_api';

import { computePosition, getImageThemeColor } from '../utils';

export const useCropperImg = ({
  cropperRef,
  url,
  mode,
  setLoading,
  backgroundInfo,
}: {
  cropperRef: RefObject<ReactCropperElement>;
  url: string;
  mode: 'pc' | 'mobile';
  setLoading: (loading: boolean) => void;
  backgroundInfo?: BackgroundImageDetail;
}) => {
  const [gradientPosition, setGradientPosition] = useState<GradientPosition>({
    left: 0,
    right: 0,
  });
  const [themeColor, setThemeColor] = useState(
    backgroundInfo?.theme_color ?? '#fff',
  );
  const currentUrl = useRef(url);
  const { size, centerWidth } = MODE_CONFIG[mode];
  useEffect(() => {
    currentUrl.current = url;
    if (!url) {
      setThemeColor('#fff');
    }
    handleGradientPosition();
  }, [url]);

  // Set the maximum zoom ratio
  const onZoom = () => {
    const {
      width = 0,
      height = 0,
      naturalWidth = 0,
      naturalHeight = 0,
    } = cropperRef.current?.cropper?.getCanvasData() ?? {};

    if (naturalWidth > naturalHeight) {
      if (height >= size.height * 2) {
        cropperRef.current?.cropper.setCanvasData({
          height: size.width * 2,
        });
      }
    } else {
      if (width > size.width * 2) {
        cropperRef.current?.cropper.setCanvasData({
          width: size.width * 2,
        });
      }
    }
    // TODO: Because there is no zoom end event, the zoom gets the theme color in real time. The large picture card is serious, so the scene does not get the theme color temporarily, modify the interaction or try webworker to solve this problem.
    // await handleThemeColor();
  };

  const handleGradientPosition = () => {
    const position = computePosition(mode, cropperRef);
    setGradientPosition(position);
  };

  const handleDragLimit = (y: number) => {
    const cropperObj = cropperRef?.current?.cropper;

    if (!cropperObj) {
      return;
    }
    const canvasData = cropperObj?.getCanvasData();
    const imgData = cropperObj?.getImageData();
    // Image lower edge, distance, offset distance of lower edge of crop area
    const scaleTop = imgData.height + canvasData.top - size.height;
    // Image left edge, distance, offset distance from the left edge of the crop area
    const scaleLeft = ceil(imgData.left + canvasData?.left, 2);

    // Drag the picture up and down, it cannot exceed the picture container.
    if (y < 0) {
      cropperRef.current?.cropper.setCanvasData({
        top: 0,
      });
    }
    if (scaleTop < 0) {
      cropperRef.current?.cropper.setCanvasData({
        top: size.height - imgData.height,
      });
    }

    // Product requirements: Drag left and right cannot exceed, fix "dialogue bubble container" left or right 80%
    const maxRightOffset = floor(
      (size.width - centerWidth) / 2 + centerWidth * 0.4,
      2,
    );
    const maxLeftOffset = floor(size.width - imgData.width - maxRightOffset, 2);
    if (scaleLeft > maxRightOffset || scaleLeft < maxLeftOffset) {
      cropperRef.current?.cropper.setCanvasData({
        left: scaleLeft > maxRightOffset ? maxRightOffset : maxLeftOffset,
      });
    }
  };

  const handleCrop = (detail: Cropper.CropEvent) => {
    handleGradientPosition();
    handleDragLimit(detail.detail.y);
  };

  const cropEnd = async () => {
    await handleThemeColor();
    handleGradientPosition();
  };

  const handleThemeColor = async () => {
    const cropperObj = cropperRef.current?.cropper;
    // Large picture move card optimization scheme: move is prohibited before the theme color is obtained when the move stops
    cropperObj?.disable();
    // To load faster, set the picture quality to medium
    const corp = cropperObj?.getCroppedCanvas()?.toDataURL('image/webp', 0.7);
    if (corp) {
      const color = await getImageThemeColor(corp);
      setThemeColor(color);
      cropperObj?.enable();
    }
  };

  const handleReady = async () => {
    const cropperObj = cropperRef.current?.cropper;
    if (
      backgroundInfo?.canvas_position &&
      currentUrl.current === backgroundInfo.origin_image_url
    ) {
      cropperObj?.setCanvasData(backgroundInfo?.canvas_position);
    }
    await handleThemeColor();

    setLoading(false);
  };

  return {
    gradientPosition,
    handleReady,
    handleThemeColor,
    handleCrop,
    cropEnd,
    onZoom,
    themeColor,
    size,
  };
};
