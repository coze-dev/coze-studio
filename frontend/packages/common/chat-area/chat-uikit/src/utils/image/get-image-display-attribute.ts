export const getImageDisplayAttribute = (
  width: number,
  height: number,
  contentWidth: number,
) => {
  // 图片比例
  const imageRatio = width / height;

  // 展示宽度
  let displayWidth = contentWidth;
  // 展示高度
  let displayHeight = contentWidth / imageRatio;
  // 是否裁切
  let isCover = false;

  // （小尺寸图）

  if (width <= contentWidth && height <= 240) {
    displayWidth = width;
    displayHeight = height;
  } else if (imageRatio > contentWidth / 120) {
    displayWidth = contentWidth;
    displayHeight = 120;
    isCover = true;
    // （长竖图）图片宽度:图片高度 <= 0.5
  } else if (imageRatio <= 0.5) {
    displayWidth = 120;
    displayHeight = 240;
    isCover = true;
    // （等比展示图）
  } else if (0.5 <= imageRatio && imageRatio <= contentWidth / 240) {
    displayWidth = 240 * imageRatio;
    displayHeight = 240;
    // （中长横图）
  } else if (
    contentWidth / 240 <= imageRatio &&
    imageRatio <= contentWidth / 240
  ) {
    displayWidth = contentWidth;
    displayHeight = contentWidth / imageRatio;
  }

  return {
    displayHeight,
    displayWidth,
    isCover,
  };
};
