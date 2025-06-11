/**
 * 获取最近一个可滚动元素
 */
export function closestScrollableElement(element: HTMLElement) {
  const htmlElement = document.documentElement;
  if (!element) {
    return htmlElement;
  }
  let style = window.getComputedStyle(element);
  const excludeStaticParent = style.position === 'absolute';
  const overflowReg = /(auto|scroll|overlay)/;

  if (style.position === 'fixed') {
    return htmlElement;
  }
  let parent = element;
  while (parent) {
    style = window.getComputedStyle(parent);
    if (excludeStaticParent && style.position === 'static') {
      parent = parent.parentElement as HTMLElement;
      continue;
    }
    if (
      overflowReg.test(style.overflow + style.overflowY + style.overflowX) ||
      parent.getAttribute('data-overflow') === 'true'
    ) {
      return parent;
    }
    parent = parent.parentElement as HTMLElement;
  }
  return htmlElement;
}

// 解决浏览器拦截window.open行为，接口catch则跳错误兜底页
export const openNewWindow = async (
  callbackUrl: () => Promise<string> | string,
  defaultUrl?: string,
) => {
  const newWindow = window.open(defaultUrl || '');

  let url = '';
  try {
    url = await callbackUrl();
  } catch (error) {
    url = `${location.origin}/404`;
    newWindow?.close();
  }

  if (newWindow) {
    newWindow.location = url;
  }
};
