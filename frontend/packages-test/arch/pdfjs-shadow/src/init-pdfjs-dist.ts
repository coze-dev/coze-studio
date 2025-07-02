import { GlobalWorkerOptions } from 'pdfjs-dist';

import { generatePdfAssetsUrl } from './generate-assets';

/**
 * 该方法用于初始化 pdfjs-dist 的 workerSrc 参数，可重复调用
 */
export const initPdfJsWorker = () => {
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = generatePdfAssetsUrl('pdf.worker');
  }
};
