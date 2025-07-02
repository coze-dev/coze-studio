import type Cropper from 'cropperjs';

import { type CropperSizePercent } from '@/features/knowledge-type/text/interface';

const fixPrecision = (value: number) => parseFloat(value.toFixed(2));

export const convertCropDataToPercentSize = ({
  data,
  pdfSize: { naturalHeight, naturalWidth },
}: {
  data: Cropper.Data;
  pdfSize: {
    naturalHeight: number;
    naturalWidth: number;
  };
}): CropperSizePercent => {
  const topPixel = data.y;
  const bottomPixel = data.y + data.height;
  const leftPixel = data.x;
  const rightPixel = data.x + data.width;
  return {
    topPercent: fixPrecision(topPixel / naturalHeight),
    bottomPercent: fixPrecision((naturalHeight - bottomPixel) / naturalHeight),
    leftPercent: fixPrecision(leftPixel / naturalWidth),
    rightPercent: fixPrecision((naturalWidth - rightPixel) / naturalWidth),
  };
};

export const convertPercentSizeToCropData = ({
  cropSizePercent: { topPercent, bottomPercent, rightPercent, leftPercent },
  pdfSize: { naturalHeight, naturalWidth },
}: {
  cropSizePercent: CropperSizePercent;
  pdfSize: {
    naturalHeight: number;
    naturalWidth: number;
  };
}): Cropper.Data => {
  const x = leftPercent * naturalWidth;
  const y = topPercent * naturalHeight;
  const width = naturalWidth - x - naturalWidth * rightPercent;
  const height = naturalHeight - y - naturalHeight * bottomPercent;
  return {
    scaleX: 1,
    scaleY: 1,
    rotate: 0,
    x,
    y,
    width,
    height,
  };
};
