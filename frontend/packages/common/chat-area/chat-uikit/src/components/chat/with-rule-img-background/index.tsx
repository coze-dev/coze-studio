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

import { useState, useEffect } from 'react';

import { isEmpty } from 'lodash-es';
import classNames from 'classnames';

import { addAlpha, computeShowGradient } from './utils';
import {
  type CanvasPosition,
  type GradientPosition,
  type BackgroundImageInfo,
} from './types';
import { useGetResponsiveBackgroundInfo } from './hooks/use-get-background-info';

export interface WithRuleImgBackgroundProps {
  preview?: boolean;
  backgroundInfo?: BackgroundImageInfo;
  onError?: () => void;
}

export const Gradient: React.FC<{
  position: number;
  preview: boolean;
  showGradient: boolean;
  background: string;
  direction: 'left' | 'right';
}> = ({ position, preview, showGradient, background, direction }) => (
  <div
    className={classNames('absolute -translate-y-1/2 top-1/2 h-full z-10', {
      'transition-all duration-500': !preview,
    })}
    style={{
      [direction]: `${(position > 0 ? position : 0) * 100 - 0.1}%`, // 0.1 is shadow compensation to prevent gaps.
      width: '10%',
      background,
      opacity: showGradient ? 1 : 0,
    }}
  ></div>
);
const getGradient = (
  gradient: GradientPosition,
  canvasData: CanvasPosition,
  cropperWidth = 1,
) => {
  const { left: cropperImgLeft = 0, width: cropperImgWidth = 0 } = canvasData;
  // Pseudo-cropping, compatibility with inaccurate historical gradients
  if (!isEmpty(canvasData)) {
    return {
      left: cropperImgLeft / cropperWidth,
      right: (cropperWidth - cropperImgWidth - cropperImgLeft) / cropperWidth,
    };
  } else {
    return gradient;
  }
};
export const WithRuleImgBackground: React.FC<WithRuleImgBackgroundProps> = ({
  preview = false,
  backgroundInfo,
}) => {
  const {
    currentBackgroundInfo,
    targetHeight,
    targetWidth,
    targetRef,
    cropperSize,
  } = useGetResponsiveBackgroundInfo({
    backgroundInfo,
  });

  const {
    theme_color,
    gradient_position = {},
    canvas_position = {},
  } = currentBackgroundInfo ?? {};
  const { left: gradientLeft = 0, right: gradientRight = 0 } = getGradient(
    gradient_position,
    canvas_position,
    cropperSize.width,
  );
  const { top: cropperImgTop = 0, height: cropperImgHeight = 0 } =
    canvas_position;

  const [themeColor, setThemeColor] = useState(theme_color ?? 'transparent');

  // Calculate the width of the image rendering area in proportion to the cropping box
  const imgWidth = (targetHeight * cropperSize.width) / cropperSize.height;

  const mediumColor = addAlpha(themeColor, 0.95);

  useEffect(() => {
    if (theme_color) {
      setThemeColor(theme_color);
    }
  }, [currentBackgroundInfo]);

  return (
    <div
      data-testid="chat.with_rule_img_background"
      ref={targetRef}
      className={
        'rule-img-background absolute left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none'
      }
      style={{
        background: preview ? 'none' : themeColor,
        zIndex: preview ? 100 : 0,
      }}
    >
      {/* Black shadow on background cover */}
      <div className="bg-[rgba(0,0,0,0.12)] absolute w-full h-full z-[200] rounded-t-[6px]"></div>

      <div className="relative w-fit h-fit left-1/2 -translate-x-1/2">
        {
          <Gradient
            preview={preview}
            showGradient={computeShowGradient(
              targetWidth,
              imgWidth,
              gradientLeft,
            )}
            position={gradientLeft}
            direction="left"
            background={`linear-gradient(90deg,  ${themeColor} 10%, ${mediumColor} 28%, transparent 92.4%)`}
          />
        }
        {preview ? (
          <div
            style={{
              height: targetHeight,
              width: targetWidth,
            }}
          ></div>
        ) : (
          <div
            style={{
              width: imgWidth,
              height: targetHeight,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <img
              src={currentBackgroundInfo?.origin_image_url}
              alt=""
              style={{
                height: `${(cropperImgHeight / cropperSize.height) * 100}%`,
                position: 'absolute',
                left: `${
                  gradientLeft ? gradientLeft * 100 : -gradientRight * 2 * 100
                }%`,
                top: `${(cropperImgTop / cropperSize.height) * 100}%`,
              }}
            />
          </div>
        )}

        {
          <Gradient
            preview={preview}
            showGradient={computeShowGradient(
              targetWidth,
              imgWidth,
              gradientRight,
            )}
            position={gradientRight}
            direction="right"
            background={`linear-gradient(90deg,  transparent 10% , ${mediumColor} 72%, ${themeColor} 92%)`}
          />
        }
      </div>
    </div>
  );
};
