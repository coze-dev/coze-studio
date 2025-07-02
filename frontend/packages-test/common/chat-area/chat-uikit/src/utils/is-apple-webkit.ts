/**
 * 是否是在苹果平台的Webkit内核浏览器下，
 * 注：这个判断条件不等于是在苹果设备下，因为部分苹果设备（例如Mac）可以运行非原生Webkit引擎的浏览器，例如Chromium(Blink)
 */
export const isAppleWebkit = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof (window as any).webkitConvertPointFromNodeToPage === 'function';
