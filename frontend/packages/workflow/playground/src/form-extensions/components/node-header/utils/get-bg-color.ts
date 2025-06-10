function hexToRgb(hex) {
  hex = hex.replace('#', '');

  // 验证 hex 格式
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(hex)) {
    throw new Error('Invalid hex color format');
  }

  let r,
    g,
    b,
    a = 1;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = (parseInt(hex.substring(6, 8), 16) / 255).toFixed(
      2,
    ) as unknown as number;
  }

  return [r, g, b, a];
}

// eslint-disable-next-line max-params
function rgbaToHexWithBackground(r, g, b, a, bgR = 255, bgG = 255, bgB = 255) {
  // 确保 RGB 和 Alpha 值在正确范围内
  r = Math.min(255, Math.max(0, Math.round(r)));
  g = Math.min(255, Math.max(0, Math.round(g)));
  b = Math.min(255, Math.max(0, Math.round(b)));
  a = Math.min(1, Math.max(0, a));

  // 计算新的 RGB 值
  const newR = Math.round(r * a + bgR * (1 - a));
  const newG = Math.round(g * a + bgG * (1 - a));
  const newB = Math.round(b * a + bgB * (1 - a));

  // 转换为十六进制并确保两位数
  const toHex = n => {
    const hex = n.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  // 返回 6 位十六进制颜色值
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export const getBgColor = (mainColor: string, opacity: number) => {
  const themeColor = mainColor || '#5C62FF';

  const [r, g, b] = hexToRgb(themeColor);

  return rgbaToHexWithBackground(r, g, b, opacity);
};
