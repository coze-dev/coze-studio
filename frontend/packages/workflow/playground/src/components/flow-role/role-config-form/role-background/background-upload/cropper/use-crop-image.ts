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

  // 设置最大缩放比例
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
    // TODO:因没有缩放end事件，缩放实时获取主题色大图卡顿严重，故此场景临时先不获取主题色，修改交互or尝试webworker解决此问题
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
    // 图片下边缘 距离 裁剪区下边缘的偏移距离
    const scaleTop = imgData.height + canvasData.top - size.height;
    // 图片左边缘 距离 裁剪区左 边缘的偏移距离
    const scaleLeft = ceil(imgData.left + canvasData?.left, 2);

    // 图片上下拖拽不能有超出图片容器外
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

    // UX产品需求： 左右拖动不能超过 固定“对话气泡容器” left or right 80%
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
    // 大图move卡顿优化方案：move停止时获取到主题色前 禁止移动
    cropperObj?.disable();
    // 为了加载快一些，设置图片质量中等
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
