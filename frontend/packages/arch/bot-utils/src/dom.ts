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
