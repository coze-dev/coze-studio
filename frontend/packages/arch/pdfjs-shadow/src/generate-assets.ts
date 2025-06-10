import pkg from '../package.json';

type AssetsType = 'cmaps' | 'pdf.worker';

// 这里需要写 bnpm 已经发布的版本
// 
const DEFAULT_VERSION = '0.1.0-alpha.x6e892414ec';

/**
 * 该方法用于生产 unpkg 环境的 worker & cmaps 链接，注意并非 pdfjs 原生方法
 */
export const generatePdfAssetsUrl = (assets: AssetsType) => {
  const { name } = pkg;
  let assetsUrl;
  switch (assets) {
    case 'cmaps': {
      assetsUrl = 'lib/cmaps/';
      break;
    }
    case 'pdf.worker': {
      assetsUrl = 'lib/worker.js';
      break;
    }
    default: {
      throw new Error(
        '目前只支持引用 cmaps 与 pdf.worker 文件，如需引用其他文件请联系 @fanwenjie.fe',
      );
    }
  }
  const onlinePkgName = name.replace(/^@/, '');

  const domain =
    REGION === 'cn'
      ? 'lf-cdn.coze.cn/obj/unpkg'
      : 'sf-cdn.coze.com/obj/unpkg-va';
  return `//${domain}/${onlinePkgName}/${DEFAULT_VERSION}/${assetsUrl}`;
};
