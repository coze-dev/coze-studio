export {
  getDocument,
  type PDFDocumentProxy,
  type PDFPageProxy,
  type PageViewport,
} from 'pdfjs-dist';

export { type TextContent } from 'pdfjs-dist/types/src/display/text_layer';
export { type TextItem } from 'pdfjs-dist/types/src/display/api';
export { generatePdfAssetsUrl } from './generate-assets';
export { initPdfJsWorker } from './init-pdfjs-dist';
