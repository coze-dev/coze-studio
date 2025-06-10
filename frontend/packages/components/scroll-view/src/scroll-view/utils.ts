/**
 * 出自：https://stackoverflow.com/questions/4900436/how-to-detect-the-installed-chrome-version
 */
export const getChromeVersion = () => {
  const pieces = navigator.userAgent.match(
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/,
  );
  const MAX_LENGTH = 5;
  if (pieces === null || pieces.length !== MAX_LENGTH) {
    return undefined;
  }

  const [, major, minor, build, patch] = pieces.map(piece =>
    parseInt(piece, 10),
  );
  return {
    major,
    minor,
    build,
    patch,
  };
};

/**
 * 是否支持在column-reverse模式下为负数的scrollTop，chromium最低支持版本83.0.4086.1（上一个版本为82.0.4082.0）
 */
export const supportNegativeScrollTop = () => {
  const chromeVersion = getChromeVersion();

  if (!chromeVersion) {
    /** 假设非chromium系浏览器均支持 */
    return true;
  }

  const { major } = chromeVersion;

  const MAX_MAJOR = 83;
  return major >= MAX_MAJOR;
};
