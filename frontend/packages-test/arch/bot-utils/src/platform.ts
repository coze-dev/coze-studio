import Browser from 'bowser';

const browser = Browser.getParser(window.navigator.userAgent);

let getIsMobileCache: boolean | undefined;
/**
 * 是否是移动设备
 * 注：ipad 不是移动设备
 */
const isMobile = () => browser.getPlatformType(true).includes('mobile');

export const getIsMobile = () => {
  if (typeof getIsMobileCache === 'undefined') {
    getIsMobileCache = isMobile();
  }
  return getIsMobileCache;
};

let getIsIPhoneOrIPadCache: boolean | undefined;
/**
 * gpt-4 提供的代码
 */
export const getIsIPhoneOrIPad = () => {
  if (typeof getIsIPhoneOrIPadCache === 'undefined') {
    const { userAgent } = navigator;
    const isAppleDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isIPadOS =
      userAgent.includes('Macintosh') &&
      'ontouchstart' in document.documentElement;

    getIsIPhoneOrIPadCache = isAppleDevice || isIPadOS;
  }

  return getIsIPhoneOrIPadCache;
};

let getIsIPadCache: boolean | undefined;
/**
 * gpt-4 提供的代码
 */
export const getIsIPad = () => {
  if (typeof getIsIPadCache === 'undefined') {
    const { userAgent } = navigator;
    const isIPadDevice = /iPad/.test(userAgent);
    const isIPadOS =
      userAgent.includes('Macintosh') &&
      'ontouchstart' in document.documentElement;

    getIsIPadCache = isIPadDevice || isIPadOS;
  }

  return getIsIPadCache;
};

export const getIsMobileOrIPad = () => getIsMobile() || getIsIPhoneOrIPad();

export const getIsSafari = () => browser.getBrowserName(true) === 'safari';
