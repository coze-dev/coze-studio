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

import { floor, pick } from 'lodash-es';
import ColorThief from 'colorthief';
import { MODE_CONFIG } from '@coze-common/chat-uikit';
import { I18n } from '@coze-arch/i18n';
import { UIToast } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';
import { type PicTask } from '@coze-arch/bot-api/playground_api';
import {
  type BackgroundImageInfo,
  type CanvasPosition,
  type GradientPosition,
} from '@coze-arch/bot-api/developer_api';

const MIN_HEIGHT = 640;
// The function that limits the width and height of the image upload, returns true if the conditions are met, false if not
export const checkImageWidthAndHeight = (file: Blob): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (!result || typeof result !== 'string') {
        reject(
          new CustomError('checkImageWidthAndHeight', 'file read invalid'),
        );
        return;
      }
      const image = new Image();
      image.src = result;
      image.onload = function () {
        if (image.height < MIN_HEIGHT) {
          UIToast.error(I18n.t('bgi_upload_image_format_requirement'));
          resolve(false);
        } else if (image.complete) {
          resolve(true);
        }
      };
    };
    fileReader.onerror = () => {
      reject(new CustomError('checkImageWidthAndHeight', 'file read fail'));
    };
    fileReader.onabort = () => {
      reject(new CustomError('checkImageWidthAndHeight', 'file read abort'));
    };
    fileReader.readAsDataURL(file);
  });

export const getModeInfo = (mode: 'pc' | 'mobile') => MODE_CONFIG[mode];

export const getOriginImageFromBackgroundInfo = (
  value: BackgroundImageInfo[],
): {
  url: string;
  uri: string;
} => ({
  url: value[0]?.web_background_image?.origin_image_url ?? '',
  uri: value[0]?.web_background_image?.origin_image_uri ?? '',
});

export const getInitBackground = ({
  isGenerateSuccess,
  selectedImageInfo,
  originBackground,
}: {
  isGenerateSuccess: boolean;
  originBackground: BackgroundImageInfo[];
  selectedImageInfo: PicTask['img_info'];
}) => {
  if (isGenerateSuccess && selectedImageInfo?.tar_url) {
    return {
      url: selectedImageInfo.tar_url,
      uri: selectedImageInfo.tar_uri,
    };
  }
  if (getOriginImageFromBackgroundInfo(originBackground).url) {
    return getOriginImageFromBackgroundInfo(originBackground);
  }

  return {};
};

// Calculate shadow position
export const computePosition = (
  mode: 'pc' | 'mobile',
  cropperRef: RefObject<ReactCropperElement>,
): GradientPosition => {
  const cropperObj = cropperRef?.current?.cropper;
  if (!cropperObj) {
    return {
      left: 0,
      right: 0,
    };
  }
  const { size } = getModeInfo(mode);
  const cropperWidth = size.width;
  const canvasData = cropperObj?.getCanvasData();
  const imgData = cropperObj?.getImageData();

  // Image left edge, distance, offset distance from the left edge of the crop area
  const imgToScreenLeft = imgData.left + canvasData?.left;
  // The distance of the picture from the right screen, > 0, the right side is not full of pictures
  const imgToScreenRight = cropperWidth - imgData.width - imgToScreenLeft;

  // Left value required for gradual change of left rendering: render left when there is a gap on the left, otherwise no need
  const leftPercent = floor(imgToScreenLeft / cropperWidth, 2);

  // The right value required for gradual change of right rendering
  const rightPercent = floor(imgToScreenRight / cropperWidth, 2);

  return {
    left: leftPercent,
    right: rightPercent,
  };
};

export const canvasPosition = (
  cropperRef: RefObject<ReactCropperElement>,
): CanvasPosition =>
  pick(cropperRef.current?.cropper.getCanvasData(), [
    'left',
    'top',
    'width',
    'height',
  ]);

// Calculate theme color
export const computeThemeColor = (
  cropperRefList: RefObject<ReactCropperElement>[],
): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const promises: Promise<string>[] = [];
    // Process each canvas element
    cropperRefList.forEach(cropperEle => {
      promises.push(
        new Promise<string>((resolveColor, rejectColor) => {
          const cropperObj = cropperEle.current?.cropper;
          const corp = cropperObj
            ?.getCroppedCanvas()
            ?.toDataURL('image/webp', 0.7);
          if (!corp) {
            rejectColor(
              new CustomError('computeThemeColor', 'cropper not exist'),
            );
          } else {
            getImageThemeColor(corp).then((res: string) => {
              resolveColor(res);
            });
          }
        }),
      );
    });
    Promise.all(promises)
      .then(colors => resolve(colors))
      .catch(error => reject(error));
  });

export function getImageThemeColor(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const colorThief = new ColorThief();
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const thiefColor = colorThief.getColor(img);
      if (thiefColor) {
        const [a, b, c] = thiefColor;
        const color = `rgba(${a}, ${b}, ${c})`;
        resolve(color);
      } else {
        reject(new CustomError('getImageThemeColor', 'not get theme color'));
      }
    };
  });
}
