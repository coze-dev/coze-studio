import { useRef } from 'react';

import { useSize } from 'ahooks';

import { getStandardRatio } from '../utils';
import { type BackgroundImageInfo } from '../types';
import { MODE_CONFIG } from '../const';

export const useGetResponsiveBackgroundInfo = ({
  backgroundInfo,
}: {
  backgroundInfo?: BackgroundImageInfo;
}) => {
  const targetRef = useRef(null);

  const size = useSize(targetRef);
  const { width = 0, height = 0 } = size ?? {};

  const isMobileMode = width / height <= getStandardRatio('mobile');

  const mobileBackgroundInfo = backgroundInfo?.mobile_background_image;
  const pcBackgroundInfo = backgroundInfo?.web_background_image;

  const currentBackgroundInfo = isMobileMode
    ? mobileBackgroundInfo
    : pcBackgroundInfo;

  const { theme_color } = currentBackgroundInfo ?? {};
  const { size: cropperSize } = MODE_CONFIG[isMobileMode ? 'mobile' : 'pc'];

  return {
    targetRef,
    currentBackgroundInfo,
    targetWidth: width,
    targetHeight: height,
    currentThemeColor: theme_color,
    cropperSize,
  };
};
